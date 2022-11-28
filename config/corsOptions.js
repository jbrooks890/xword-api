const allowedOrigins = [
  "http://127.0.0.1",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://xword-app.herokuapp.com/",
  "http://xword-app.herokuapp.com/",
  "https://xword-app-beta.netlify.app/",
  "http://xword-app-beta.netlify.app/",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log({ origin });
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// console.log("allowed origins:", allowedOrigins, "\ncors config:", corsOptions); //TODO

module.exports = { corsOptions };
