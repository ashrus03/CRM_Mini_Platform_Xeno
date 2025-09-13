import Joi from "joi";

export const orderSchema = Joi.object({
  email: Joi.string().email().required(),
  orderDate: Joi.date().iso().required(),
  amount: Joi.number().positive().required(),
  items: Joi.array().items(Joi.string()).optional(),
});

export const ingestOrdersSchema = Joi.alternatives().try(
  Joi.array().items(orderSchema),
  orderSchema
);
