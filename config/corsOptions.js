const allowedOrigins = [
  "http://127.0.0.1",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://xword-app.herokuapp.com",
  "http://xword-app.herokuapp.com",
  "https://xword-app-beta.netlify.app",
  "http://xword-app-beta.netlify.app",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
