const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      /\.vercel\.app$/, // allow ALL vercel previews
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/timer", require("./routes/timer"));
app.use("/answers", require("./routes/answers"));

app.use("/logs", require("./routes/logs"));

app.listen(5000, () => {
  console.log("server running port 5000");
});
