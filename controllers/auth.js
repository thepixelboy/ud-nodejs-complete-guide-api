const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

require("dotenv").config();

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });
    const result = await user.save();
    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  // bcrypt
  //   .hash(password, 12)
  //   .then((hashedPw) => {
  //     const user = new User({
  //       email: email,
  //       password: hashedPw,
  //       name: name,
  //     });
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.status(201).json({ message: "User created!", userId: result._id });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("The email or password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("The email or password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  // User.findOne({ email: email })
  //   .then((user) => {
  //     if (!user) {
  //       const error = new Error("The email or password is incorrect.");
  //       error.statusCode = 401;
  //       throw error;
  //     }
  //     loadedUser = user;
  //     return bcrypt.compare(password, user.password);
  //   })
  //   .then((isEqual) => {
  //     if (!isEqual) {
  //       const error = new Error("The email or password is incorrect.");
  //       error.statusCode = 401;
  //       throw error;
  //     }
  //     const token = jwt.sign(
  //       {
  //         email: loadedUser.email,
  //         userId: loadedUser._id.toString(),
  //       },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "1h" }
  //     );
  //     res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // User.findById(req.userId)
  //   .then((user) => {
  //     if (!user) {
  //       const error = new Error("User not found.");
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //     res.status(200).json({ status: user.status });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "User updated." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // User.findById(req.userId)
  //   .then((user) => {
  //     if (!user) {
  //       const error = new Error("User not found.");
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //     user.status = newStatus;
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.status(200).json({ message: "User updated." });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
};
