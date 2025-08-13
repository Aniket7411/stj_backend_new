const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const encryptionSecret = process.env.ENCRYPTION_SECRET; // Ensure this is securely stored and is 32 bytes for AES-256

function encrypt(text) {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionSecret, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

function decrypt(encryptedData, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionSecret, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const createToken = ({ email, userId, role }) => {
  const now = Date.now();
  const payload = JSON.stringify({
    email,
    userId,
    role,
    iat: now,
    exp: now + 1000 * 60 * 60 * 8,  // 1h duration  . 8 hrs shift
  });
  const { encryptedData, iv } = encrypt(payload);

  const tokenPayload = {
    data: encryptedData,
    iv,
  };

  if (!email) {
    throw new Error("User data is required to generate a token");
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("Access token secret is not defined");
  }
  try {
    const token = JWT.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET);
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
};

const verifyToken = (token) => {
  const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const decryptedData = decrypt(decoded.data, decoded.iv);
  console.log(decryptedData,"63");
  const { email, userId, role, exp, iat } = JSON.parse(decryptedData);

  return { email, userId, role, exp, iat };
};

const refToken = ({ email, userId, role }) => {
  const now = Date.now();
  const payload = JSON.stringify({
    email,
    userId,
    role,
    iat: now,
    exp: now + 1000 * 60 * 60 * 6,  // 6h duration
  });
  const { encryptedData, iv } = encrypt(payload);

  const tokenPayload = {
    data: encryptedData,
    iv,
  };

  if (!email) {
    throw new Error("User data is required to generate a token");
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("refresh token secret is not defined");
  }
  try {
    const refreshtoken = JWT.sign(
      tokenPayload,
      process.env.REFRESH_TOKEN_SECRET
    );
    return refreshtoken;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
};

const verifyRefreshToken = (refreshtoken) => {
  const decoded = JWT.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET);
  const decryptedData = decrypt(decoded.data, decoded.iv);
  const { email, userId, role, exp, iat } = JSON.parse(decryptedData);

  return { email, userId, role, exp, iat };
};

module.exports = {
  createToken,
  verifyToken,
  refToken,
  verifyRefreshToken,
};
