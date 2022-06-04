const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.secret);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
  if (!decodedToken) {
    const error = new Error("Authentication faild!");
    error.statusCode = 500;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
