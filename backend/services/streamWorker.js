import redis from "./redisClient.js";
import CommunicationLog from "../models/CommunicationLog.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import connectToDB from "../config/db.js";

const CUSTOMER_STREAM_KEY = "customer_ingestion_stream";
const CUSTOMER_GROUP_NAME = "customer_group";
const CUSTOMER_CONSUMER_NAME = "worker_customer_1";

const ORDER_STREAM_KEY = "order_ingestion_stream";
const ORDER_GROUP_NAME = "order_group";
const ORDER_CONSUMER_NAME = "worker_order_1";

const LOG_STREAM_KEY = "log_update_stream";
const LOG_GROUP_NAME = "log_group";
const LOG_CONSUMER_NAME = "worker_log_1";

const BATCH_SIZE = 100;
const BATCH_TIMEOUT = 5000;

connectToDB();

async function initializeGroup(key, group) {
  try {
    await redis.xgroup("CREATE", key, group, "0", "MKSTREAM");
    console.log(`Consumer group "${group}" created`);
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error(`Error creating group "${group}":`, err);
    }
  }
}

function parseFields(fields) {
  const obj = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
  return obj;
}

async function processCustomerMessages() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        CUSTOMER_GROUP_NAME,
        CUSTOMER_CONSUMER_NAME,
        "BLOCK",
        1000,
        "COUNT",
        10,
        "STREAMS",
        CUSTOMER_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      const entries = [];

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          entries.push({ id, data });
        }
      }

      if (entries.length > 0) {
        await handleCustomerIngestion(entries);
      }
    } catch (err) {
      console.error("Customer stream read error:", err.message);
    }
  }
}

async function handleCustomerIngestion(entries) {
  const bulkOps = [];
  const ackIds = [];

  for (const { id, data } of entries) {
    try {
      const parsed = {
        owner: data.owner,
        email: data.email,
        name: data.name,
        phone: data.phone,
      };

      bulkOps.push({
        updateOne: {
          filter: { owner: parsed.owner, email: parsed.email },
          update: { $set: parsed },
          upsert: true,
        },
      });

      ackIds.push(id);
    } catch (err) {
      console.error("Error processing customer:", err.message);
    }
  }
  if (bulkOps.length > 0) {
    try {
      await Customer.bulkWrite(bulkOps);
      await redis.xack(CUSTOMER_STREAM_KEY, CUSTOMER_GROUP_NAME, ...ackIds);
      console.log(`Successfully ingested ${bulkOps.length} customers`);
    } catch (err) {
      console.error("Bulk ingestion error:", err.message);
    }
  }
}

async function handleOrderIngestion(entries) {
  const ordersToInsert = [];
  const customerUpdates = new Map();
  const ackIds = [];

  for (const { id, data } of entries) {
    try {
      const { customerId, owner, orderDate, amount, email, items } = data;

      const parsedItems = JSON.parse(items || "[]");
      const parsedAmount = Number(amount);

      ordersToInsert.push({
        customerId,
        owner,
        orderDate: new Date(orderDate), // Ensure it's a date object
        amount: parsedAmount,
        email,
        items: parsedItems,
      });

      // This is the logic that tracks updates for each customer
      if (!customerUpdates.has(customerId)) {
        customerUpdates.set(customerId, {
          totalSpend: 0,
          visitCount: 0,
          lastPurchased: new Date(orderDate),
        });
      }
      const update = customerUpdates.get(customerId);
      update.totalSpend += parsedAmount;
      update.visitCount += 1; // THE FIX: Increment visit count for each order
      update.lastPurchased = new Date(orderDate); // Track the latest purchase date

      ackIds.push(id);
    } catch (err) {
      console.error("Error parsing order message:", err.message);
    }
  }

  try {
    if (ordersToInsert.length > 0) {
      await Order.insertMany(ordersToInsert);
      console.log(`Inserted ${ordersToInsert.length} orders`);
    }

    const bulkCustomerOps = Array.from(customerUpdates.entries()).map(
      ([customerId, { totalSpend, visitCount, lastPurchased }]) => ({
        updateOne: {
          filter: { _id: customerId },
          update: {
            $inc: {
              totalSpend: totalSpend,
              visits: visitCount, // THE FIX: Apply the visit count increment
            },
            $set: { lastPurchased: lastPurchased },
          },
        },
      })
    );

    if (bulkCustomerOps.length > 0) {
      await Customer.bulkWrite(bulkCustomerOps);
      console.log(`Updated ${bulkCustomerOps.length} customers`);
    }

    if (ackIds.length > 0) {
      await redis.xack(ORDER_STREAM_KEY, ORDER_GROUP_NAME, ...ackIds);
    }
  } catch (err) {
    console.error("Bulk order ingestion error:", err.message);
  }
}

async function handleOrderIngestion(entries) {
  const ordersToInsert = [];
  const customerUpdates = new Map();
  const ackIds = [];

  for (const { id, data } of entries) {
    try {
      const { customerId, owner, orderDate, amount, email, items } = data;

      const parsedItems = JSON.parse(items || "[]");
      const parsedAmount = Number(amount);

      ordersToInsert.push({
        customerId,
        owner,
        orderDate,
        amount: parsedAmount,
        email,
        items: parsedItems,
      });

      if (!customerUpdates.has(customerId)) {
        customerUpdates.set(customerId, {
          totalSpend: 0,
          lastPurchased: orderDate,
        });
      }
      const update = customerUpdates.get(customerId);
      update.totalSpend += parsedAmount;
      update.lastPurchased = orderDate;

      ackIds.push(id);
    } catch (err) {
      console.error("Error parsing order message:", err.message);
    }
  }

  try {
    if (ordersToInsert.length > 0) {
      await Order.insertMany(ordersToInsert);
      console.log(`Inserted ${ordersToInsert.length} orders`);
    }

    const bulkCustomerOps = Array.from(customerUpdates.entries()).map(
      ([customerId, { totalSpend, lastPurchased }]) => ({
        updateOne: {
          filter: { _id: customerId },
          update: {
            $inc: { totalSpend },
            $set: { lastPurchased },
          },
        },
      })
    );

    if (bulkCustomerOps.length > 0) {
      await Customer.bulkWrite(bulkCustomerOps);
      console.log(`Updated ${bulkCustomerOps.length} customers`);
    }

    if (ackIds.length > 0) {
      await redis.xack(ORDER_STREAM_KEY, ORDER_GROUP_NAME, ...ackIds);
    }
  } catch (err) {
    console.error("Bulk order ingestion error:", err.message);
  }
}

async function processLogUpdates() {
  let batch = [];
  let batchTimeout = null;

  const processBatch = async (logs) => {
    if (logs.length === 0) return;

    console.log(`Processing batch of ${logs.length} delivery logs`);
    const updates = [];
    const campaignUpdates = new Map();

    for (const log of logs) {
      const {
        campaignId,
        customerId,
        delivery_status,
        message,
        vendor_reference,
      } = log.data;
      updates.push({
        updateOne: {
          filter: { campaignId, customerId },
          update: {
            $set: {
              delivery_status,
              message,
              vendor_reference,
            },
          },
        },
      });

      if (!campaignUpdates.has(campaignId)) {
        campaignUpdates.set(campaignId, {
          sent: 0,
          failed: 0,
        });
      }
      const stats = campaignUpdates.get(campaignId);
      if (delivery_status === "sent" || delivery_status === "failed") {
        stats[delivery_status]++;
      }
    }

    try {
      if (updates.length > 0) {
        await CommunicationLog.bulkWrite(updates);
      }

      for (const [campaignId, stats] of campaignUpdates) {
        const updateObj = {};
        if (stats.sent) updateObj["deliveryStats.sent"] = stats.sent;
        if (stats.failed) updateObj["deliveryStats.failed"] = stats.failed;

        const campaign = await Campaign.findByIdAndUpdate(
          campaignId,
          { $inc: updateObj },
          { new: true }
        );

        if (campaign) {
          const total =
            campaign.deliveryStats.sent + campaign.deliveryStats.failed;
          if (
            total >= campaign.audienceSize &&
            campaign.status !== "completed"
          ) {
            await Campaign.findByIdAndUpdate(campaignId, {
              status: "completed",
            });
            console.log(
              `Campaign ${campaignId} completed. Final stats - Sent: ${campaign.deliveryStats.sent}, Failed: ${campaign.deliveryStats.failed}`
            );
          }
        }
      }

      for (const log of logs) {
        await redis.xack(LOG_STREAM_KEY, LOG_GROUP_NAME, log.id);
      }

      console.log(
        `Successfully processed batch of ${logs.length} delivery logs`
      );
    } catch (err) {
      console.error("Error processing batch:", err);
    }
  };

  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        LOG_GROUP_NAME,
        LOG_CONSUMER_NAME,
        "BLOCK",
        1000,
        "COUNT",
        BATCH_SIZE,
        "STREAMS",
        LOG_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          batch.push({
            id,
            data: parseFields(fields),
          });

          if (batch.length >= BATCH_SIZE) {
            clearTimeout(batchTimeout);
            const currentBatch = [...batch];
            batch = [];
            await processBatch(currentBatch);
          } else if (batch.length > 0 && !batchTimeout) {
            batchTimeout = setTimeout(async () => {
              const currentBatch = [...batch];
              batch = [];
              batchTimeout = null;
              await processBatch(currentBatch);
            }, BATCH_TIMEOUT);
          }
        }
      }
    } catch (err) {
      console.error("Error processing log updates:", err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

(async () => {
  await initializeGroup(CUSTOMER_STREAM_KEY, CUSTOMER_GROUP_NAME);
  await initializeGroup(ORDER_STREAM_KEY, ORDER_GROUP_NAME);
  await initializeGroup(LOG_STREAM_KEY, LOG_GROUP_NAME);

  processCustomerMessages();
  processOrderMessages();
  processLogUpdates();
})();
