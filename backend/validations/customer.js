import Joi from "joi";

export const customerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
});

export const ingestCustomersSchema = Joi.alternatives().try(
  Joi.array().items(customerSchema),
  customerSchema
);
