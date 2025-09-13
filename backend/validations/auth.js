import Joi from "joi";

const authSchema = Joi.object({
  credentials: Joi.string().required().label("Google Credentials"),
});

export default authSchema;
