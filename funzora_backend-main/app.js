//Required libs
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const setupRoutes = require("./routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ limit: "1024mb", extended: true }));

app.get("/", (req, res) => {
  return res.json({
    healthly: true,
  });
});

require("./mongoConnection");

setupRoutes(app);

app.listen(PORT, () => {
  console.log(`SERVER IS UP RUNNING ON PORT ${PORT}.`);
});
