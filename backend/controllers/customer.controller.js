import { ingestCustomersSchema } from "../validations/customer.js";
import redis from "../services/redisClient.js";

export const ingestCustomers = async (req, res) => {
  let customers = req.body.type;
  if (!Array.isArray(customers)) customers = [customers];

  const { error } = ingestCustomersSchema.validate(customers);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const pipeline = redis.pipeline();
    for (const cust of customers) {
      pipeline.xadd(
        "customer_ingestion_stream",
        "*",
        "owner",
        req.userId,
        "email",
        cust.email,
        "name",
        cust.name,
        "phone",
        cust.phone || ""
      );
    }
    await pipeline.exec();

    res.status(200).json({
      success: true,
      message: `${customers.length} customers ingested`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};