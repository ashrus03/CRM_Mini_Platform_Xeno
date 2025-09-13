import Customer from "../models/Customer.js";
import { ingestOrdersSchema } from "../validations/order.js";
import redis from "../services/redisClient.js";

export const ingestOrders = async (req, res) => {
  let orders = req.body.type;
  if (!Array.isArray(orders)) orders = [orders];

  const { error } = ingestOrdersSchema.validate(orders);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const emails = [...new Set(orders.map((o) => o.email))];
    const customers = await Customer.find({
      owner: req.userId,
      email: { $in: emails },
    }).select("_id email");

    const emailToCustomerId = {};
    customers.forEach((cust) => {
      emailToCustomerId[cust.email] = cust._id;
    });
    const failedEmails = [];
    const pipeline = redis.pipeline();
    for (const order of orders) {
      const customerId = emailToCustomerId[order.email];
      if (!customerId) {
        failedEmails.push(order.email);
        continue;
      }
      pipeline.xadd(
        "order_ingestion_stream",
        "*",
        "customerId",
        customerId.toString(),
        "owner",
        req.userId.toString(),
        "orderDate",
        order.orderDate,
        "amount",
        order.amount.toString(),
        "email",
        order.email,
        "items",
        JSON.stringify(order.items || [])
      );
    }
    await pipeline.exec();
    if (failedEmails.length > 0) {
      return res.status(207).json({
        success: false,
        message: `Some orders failed due to missing customers`,
        failedEmails,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `${orders.length} orders ingested`,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};