const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

const generateToken = user =>
  jwt.sign(user, ACCESS_TOKEN, { expiresIn: "10m" });

// <><><><><><><><><> CREATE NEW USER <><><><><><><><><>

const createUser = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await new User({ ...req.body, password: hash });
    await user.save();
    return res.status(201).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> VALIDATE USER (on login) <><><><><><><><><>

const validateUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).send("User does not exist.");

  try {
    if (await bcrypt.compare(password, user.password)) {
      const $user = { username, password: user.password };
      const accessToken = generateToken($user);
      const refreshToken = jwt.sign($user, REFRESH_TOKEN);
      res.status(201).json({ accessToken, refreshToken });
    } else {
      req.send("Invalid user");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> DEAUTH REFRESH TOKEN <><><><><><><><><>

const deauthToken = (req, res) => {
  const { token } = req.body;
  try {
    // TODO: find token and delete
    res.sendStatus(204);
  } catch (err) {
    req.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> AUTHENTICATE TOKEN (MIDDLE) <><><><><><><><><>

const $authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// <><><><><><><><><> VERIFY TOKEN (MIDDLE) <><><><><><><><><>

const verifyRefreshToken = (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  // TODO: if database doesn't include the refreshtoken, return 403
  jwt.verify(refreshToken, REFRESH_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateToken({ name: user.name });
    res.json({ accessToken });
  });
};

// ----------------------------------------------------------------
// <><><><><><><><><><><><><><> EXPORT <><><><><><><><><><><><><><>
// ----------------------------------------------------------------

module.exports = { createUser, validateUser };
