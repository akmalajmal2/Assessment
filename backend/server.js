const express = require("express");

const app = express();

app.use(express.json());
app.use("/timer", require("./routes/timer"));
app.use("/logs", require("./routes/logs"));

app.listen(5000, () => {
  console.log("server running port 5000");
});
