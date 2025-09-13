import {
  simulateDeliverySchema,
  updateLogSchema,
} from "../validations/delivery.js";
import redis from "../services/redisClient.js";
import axios from "axios";

const DELIVERY_SUCCESS_RATE = 0.9;

export const simulateDelivery = async (req, res) => {
  const { error } = simulateDeliverySchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { campaignId, vendor_reference, personalizedMessage, customers } =
    req.body;

  const receiptPayload = customers.map((customer) => {
    const isSuccess = Math.random() < DELIVERY_SUCCESS_RATE;

    console.log(
      `Campaign ${campaignId} - Attempting delivery to ${customer.email}`
    );

    return {
      campaignId,
      customerId: customer.customerId,
      delivery_status: isSuccess ? "sent" : "failed",
      message: personalizedMessage,
      vendor_reference,
    };
  });

  try {
    await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/receipt`, {
      deliveries: receiptPayload,
    });

    res.json({
      success: true,
      message: `Batch of ${customers.length} deliveries processed.`,
    });
  } catch (error) {
    console.error("Error in bulk delivery simulation:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLog = async (req, res) => {
  const { error } = updateLogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const logs = req.body;

  try {
    const multi = redis.multi();

    logs.forEach((log) => {
      const {
        campaignId,
        customerId,
        delivery_status,
        vendor_reference,
        message,
      } = log;

      multi.xadd(
        "log_update_stream",
        "*",
        "campaignId",
        campaignId,
        "customerId",
        customerId,
        "delivery_status",
        delivery_status,
        "vendor_reference",
        vendor_reference,
        "message",
        message
      );
    });

    await multi.exec();

    res.status(200).json({
      success: true,
      message: `${logs.length} logs queued for processing`,
    });
  } catch (error) {
    console.error("Error updating delivery logs:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
