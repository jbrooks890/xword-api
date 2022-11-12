const express = require("express");
const cors = require("cors"); // WHAT IS CORS
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

const app = express();
app.use(express.json()); // USE()?
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // CROSS ORIGIN RESOURCE SHARING
app.use(logger("dev"));
app.use(cookieParser());
app.use("/api", routes);

module.exports = app;
