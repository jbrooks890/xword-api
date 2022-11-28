const express = require("express");
const cors = require("cors"); // CROSS ORIGIN RESOURCE SHARING
const { corsOptions } = require("./config/corsOptions");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

const app = express();
console.log("corsOptions:", corsOptions);

// app.use(cors());
app.use(cors(corsOptions));
app.use(express.json()); // USE()?
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cookieParser());
app.get("/", (req, res) => res.json(corsOptions)); // TODO: remove
app.use("/api", routes);

module.exports = app;
