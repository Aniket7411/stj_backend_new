const { verifyToken } = require("../token/userToken");
const Blacklist = require("../models/blacklist.models");

const tokenMiddleware = (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      console.log(req.headers,".............8")
      if (token.length < 10) {
        return res.status(400).json({ success: false, message: "Invalid token" });
      }
      const decodedData = verifyToken(token);
      console.log(decodedData,".......12")
      if (!decodedData) {
        return res.status(400).json({ success: false, message: "Invalid token" });
      }
      req.user = {
        email: decodedData.email,
        userId: decodedData.userId,
        role: decodedData.role,
        exp: decodedData.exp,
        iat: decodedData.iat
      };
      const now = Date.now();
      if (req.user.exp < now) {
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      return next();
    } else {
      return res.status(401).json({ message: 'No Authorization header was found'});
    }
  } catch (error) {
    console.error("Error in token authentication:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};



const tokenMiddlewareBoth = (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token || token.length < 10) {
        // Allow request to proceed without user authentication
        req.user = null;
        return next();
      }
      
      const decodedData = verifyToken(token);
      if (!decodedData) {
        // Allow request to proceed without user authentication
        req.user = null;
        return next();
      }

      req.user = {
        email: decodedData.email,
        userId: decodedData.userId,
        role: decodedData.role,
        exp: decodedData.exp,
        iat: decodedData.iat
      };

      const now = Math.floor(Date.now() / 1000); // Convert to seconds for comparison
      if (req.user.exp < now) {
        // Allow request to proceed without user authentication
        req.user = null;
        return next();
      }

      return next(); // Token is valid, proceed to the next middleware or route
    } else {
      // No Authorization header, allow request to proceed
      req.user = null;
      return next();
    }
  } catch (error) {
    console.error("Error in token authentication:", error);
    // Allow request to proceed even in case of an error
    req.user = null;
    return next();
  }
};


const checkLogin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header.split(" ")[1];

    const checkIfBlacklisted = await Blacklist.findOne({ token: token });
    console.log(checkIfBlacklisted,".........................44")
    if (checkIfBlacklisted){
      return res
        .status(401)
        .json({ message: "This session has expired. Please login" });
    }
      console.log(next,"......50")
    return next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(403).json({ success: false, message: error });
  }
};

module.exports = {
  tokenMiddleware,
  tokenMiddlewareBoth,
  checkLogin,
};
