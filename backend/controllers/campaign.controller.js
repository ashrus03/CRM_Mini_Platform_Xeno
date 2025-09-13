import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import CommunicationLog from "../models/CommunicationLog.js";
import parseRulesToMongoQuery from "../utils/parseRules.js";
import axios from "axios";
import {
  previewAudienceSchema,
  createCampaignSchema,
} from "../validations/campaign.js";

const BATCH_SIZE = 50;

export const getCampaignHistory = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ owner: req.userId })
      .sort({
        createdAt: -1,
      })
      .select("name status deliveryStats audienceSize createdAt");
    res.status(200).json({ success: true, data: { campaigns } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const previewAudienceSize = async (req, res) => {
  const { error } = previewAudienceSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { rules, logic } = req.body;

  try {
    const mongoQuery = await parseRulesToMongoQuery(rules, logic);
    const count = await Customer.countDocuments(mongoQuery);
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  const { error } = createCampaignSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const vendor_reference = req.vendor_reference;
    const { name, rules, logic, objective } = req.body;
    const mongoQuery = await parseRulesToMongoQuery(rules, logic);
    const customers = await Customer.find(mongoQuery);
    const audienceSize = customers.length;

    if (audienceSize === 0) {
      return res.status(400).json({
        success: false,
        message: "No customers match the selected criteria",
      });
    }

    const campaign = await Campaign.create({
      owner: req.userId,
      name,
      rules,
      logic,
      audienceSize,
      objective,
      deliveryStats: { sent: 0, failed: 0 },
    });

    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE);

      const logPromises = batch.map((customer) => ({
        campaignId: campaign._id,
        customerId: customer._id,
        message: `Hi ${customer.name}, ${objective}`,
        delivery_status: "pending",
        vendor_reference,
      }));

      await CommunicationLog.insertMany(logPromises);

      await axios
        .post(`${process.env.BASE_URL_BACKEND}/api/vendor/send`, {
          campaignId: campaign._id,
          vendor_reference,
          objective,
          customers: batch.map((customer) => ({
            customerId: customer._id,
            name: customer.name,
            email: customer.email,
          })),
        })
        .catch((error) => {
          console.error(`Failed to send batch message:`, error.message);
        });
    }

    res.status(201).json({
      success: true,
      data: {
        campaign,
        message: `Campaign created and ${audienceSize} messages queued for delivery`,
      },
    });
  } catch (error) {
    console.error("Campaign creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
