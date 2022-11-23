const allowedOrigins = [
  "http://127.0.0.1",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
