import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Access token is required" });
  }

  const tokenString = token.split(" ")[1];
  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid access token" });
    }
    req.userId = decoded.userId;
    req.vendor_reference = decoded.vendor_reference;
    next();
  });
};
