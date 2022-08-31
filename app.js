const express = require("express");
const cors = require("cors"); // WHAT IS MORGAN
const logger = require("morgan");
const routes = require("./routes");

const app = express();
app.use(express.json()); // USE()?
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(logger("dev"));
app.use("/api", routes);

module.exports = app;
