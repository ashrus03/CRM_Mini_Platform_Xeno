import User from "../models/User.js";
import authSchema from "../validations/auth.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

export const authenticateUser = async (req, res) => {
  const { error } = authSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { credentials } = req.body;
  
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credentials,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        vendor_reference: uuidv4(),
      });
      await user.save();
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        vendor_reference: user.vendor_reference,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    req.user = payload;
    res.status(200).json({
      success: true,
      message: "Google token verified successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Error verifying Google token: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
