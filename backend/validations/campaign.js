import Joi from "joi";

export const previewAudienceSchema = Joi.object({
  rules: Joi.array().items(Joi.object()).required(),
  logic: Joi.string().valid("AND", "OR").required(),
});

export const createCampaignSchema = Joi.object({
  name: Joi.string().required(),
  rules: Joi.array().items(Joi.object()).required(),
  logic: Joi.string().valid("AND", "OR").required(),
  objective: Joi.string().required(),
});
