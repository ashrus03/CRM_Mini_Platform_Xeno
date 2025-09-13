import { model, Schema } from "mongoose";

const campaignSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rules: { type: Schema.Types.Mixed, required: true },
    logic: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
    audienceSize: { type: Number, required: true },
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
    },
    objective: { type: String, required: true },
    deliveryStats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Campaign = model("Campaign", campaignSchema);

export default Campaign;
