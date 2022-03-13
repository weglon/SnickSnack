const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyparser = require("body-parser");
const routes = require("./routes");
const posts = require("./posts");
const app = express();
const port = 3000;

mongoose
  .connect("____")
  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => {
    console.log("Couldn't connect to database");
    console.log(e);
  });

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.json());

// Calls routing
routes(app);

// Calls post requests
posts(app);

// Starting server
app.listen(process.env.PORT, () => console.log("listening on port: 3000"));
