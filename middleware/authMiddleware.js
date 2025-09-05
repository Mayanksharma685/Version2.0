import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Make sure role is available in req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      uuid: decoded.uuid,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
};
