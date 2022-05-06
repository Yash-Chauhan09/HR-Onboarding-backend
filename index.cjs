const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const authRoute = require("./auth.cjs");
const reqRoute =require("./requirement.cjs")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use((req, res, next) => {
  const host = req.headers.origin;
  if (host) {
    res.setHeader("Access-Control-Allow-Origin", host);
  }

  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use("/auth", authRoute);
app.use("/requirement",reqRoute)
app.use("/", (req, res) => {
  console.log(req.baseUrl);
  res.send({
    status: "ERROR",
    message: "PAGE_NOT_FOUND",
    data: {},
  });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
