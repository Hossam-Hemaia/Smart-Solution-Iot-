const Owner = require("../models/owner");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.postOwnerRegister = async (req, res, next) => {
  const { ownerName, email, password } = req.body;
  try {
    let owner = await Owner.findOne({ email: email });
    if (owner) {
      const error = new Error("this email is already registered!");
      error.statusCode = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    owner = new Owner({
      ownerName,
      email,
      password: hashedPassword,
    });
    await owner.save();
    res.status(201).json({
      success: true,
      message: "Owner created successfully",
      owner: owner,
    });
  } catch (err) {
    next(err);
  }
};

exports.postOwnerLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await Owner.findOne({ email: email });
    if (!user) {
      const error = new Error("Invalid email!");
      error.statusCode = 422;
      throw error;
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      const error = new Error("Wrong password!");
      error.statusCode = 422;
      throw error;
    }
    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      process.env.SECRET,
      { expiresIn: "1d" }
    );
    res
      .status(201)
      .json({ success: true, token: token, userId: user._id.toString() });
  } catch (err) {
    next(err);
  }
};
