import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    items: [String],
    orderDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Placed", "Completed", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);

export default Order;
