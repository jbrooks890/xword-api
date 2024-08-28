const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

const generateToken = (user) => {
  const userRoles = { User: 8737, Editor: 3348, Admin: 2366 };

  const { username, firstName, lastName, roles, record, drafts } = user;
  return jwt.sign(
    {
      credentials: {
        username,
        firstName,
        lastName,
        roles: roles ? Object.values(roles) : [userRoles.User],
        record: record?.toJSON({ flattenMaps: true }),
        drafts,
      },
    },
    ACCESS_TOKEN,
    {
      expiresIn: "24h", // TODO: expires ==> 15m
    }
  );
};

// <><><><><><><><><> LOGIN <><><><><><><><><>

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User does not exist." });

  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = generateToken(user);
      const refreshToken = jwt.sign({ username }, REFRESH_TOKEN, {
        expiresIn: "15d",
      });
      user.refreshToken = refreshToken;
      await user.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // inaccessible with json
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(201).json({ accessToken });
    } else {
      return res.status(401).json({ message: "Invalid user" });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ error: err.message });
  }
};

// <><><><><><><><><> DEAUTH REFRESH TOKEN (on logout) <><><><><><><><><>

const deAuth = async (req, res) => {
  const { cookies } = req;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // NOTE: requires same OPTIONS it was set wtih, except 'maxAge' and expires
    // TODO: delete access token on front end
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(204); // NO CONTENT
  }
  // TODO: delete access token on front end
  user.refreshToken = "";
  await user.save();
  res.clearCookie("jwt", { httpOnly: true }); //secure: truly - only serves on https
  res.sendStatus(204);
};

// <><><><><><><><><> AUTHENTICATE TOKEN (MIDDLE) <><><><><><><><><>
// middleware for protected routes

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization; // Bearer <TOKEN>
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); // UNAUTHORIZED

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401); // UNAUTHORIZED

  jwt.verify(token, ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403); // FORBIDDEN
    req.username = decoded.credentials.username;
    req.roles = decoded.credentials.roles;
    next();
  });
};

// <><><><><><><><><> REFRESH AUTHORIZATION <><><><><><><><><>

const refreshAuth = async ({ cookies }, res) => {
  if (!cookies?.jwt) return res.status(401).json({ cookies }); // TODO: REMOVE
  const refreshToken = cookies.jwt;
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403); // FORBIDDEN

    jwt.verify(refreshToken, REFRESH_TOKEN, (err, decoded) => {
      if (err || user.username !== decoded.username) return res.sendStatus(403);
      const accessToken = generateToken(user);
      res.json({ accessToken });
    });
  } catch (err) {
    const errMsg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : undefined;
    const response = res.status(500);
    return typeof err === "object" ? response.json(err) : response.send(errMsg);
  }
};

// <><><><><><><><><> VERIFY ROLES (MIDDLE) <><><><><><><><><>

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401); // UNAUTHORIZED
    const rolesArr = [...allowedRoles];

    const result = req.roles
      .map((role) => rolesArr.includes(role))
      .find((val) => val === true);

    if (!result) return res.sendStatus(401); // UNAUTHORIZED
    next();
  };
};

module.exports = {
  login,
  authenticate,
  refreshAuth,
  deAuth,
  verifyRoles,
};
