const express = require("express");
const cookieParser = require("cookie-parser")

const userAPI = require("./routes/user");
const catAPI = require("./routes/categories");
const PodcastAPI = require("./routes/podcast");

const app = express();

require("dotenv").config();
require("./conn/conn");

app.use(express.json());
app.use(cookieParser())

// api routes
app.use("/api/v1", userAPI);
app.use("/api/v1", catAPI);
app.use("/api/v1", PodcastAPI);

app.listen(process.env.PORT, () => {
  console.log("Server running at http://localhost:1000");
});
