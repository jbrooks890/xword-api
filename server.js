require("dotenv").config();
const app = require("./app.js");
const db = require("./db");

const PORT = process.env.PORT || 3006;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.listen(PORT, () => console.log(`Listening port: ${PORT}`));
