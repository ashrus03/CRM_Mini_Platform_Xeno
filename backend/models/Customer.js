import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    phone: String,
    totalSpend: {
      type: Number,
      default: 0,
    },
    visits: {
      type: Number,
      default: 0,
    },
    lastPurchased: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Customer = model("Customer", customerSchema);

export default Customer;
