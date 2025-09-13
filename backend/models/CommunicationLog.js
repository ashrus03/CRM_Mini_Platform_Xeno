import mongoose, { model, Schema } from "mongoose";

const communicationLogSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    message: { type: String, required: true },
    delivery_status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    vendor_reference: { type: String, required: true },
  },
  { timestamps: true }
);

const CommunicationLog =
  mongoose.models.CommunicationLog ||
  model("CommunicationLog", communicationLogSchema);

export default CommunicationLog;
