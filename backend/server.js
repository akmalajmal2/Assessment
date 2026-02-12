const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin:
      "https://assessment-gray-nine.vercel.app/" || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/timer", require("./routes/timer"));
app.use("/logs", require("./routes/logs"));

app.listen(5000, () => {
  console.log("server running port 5000");
});
