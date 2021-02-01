const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const indexHTML = fs.readFileSync(
  path.join(__dirname, "views", "index.html"),
  "utf-8"
);

app.set("port", process.env.PORT || 8080);
app.use("/kakao/:lat/:long", express.static(path.join(__dirname, "public")));

app.get("/kakao/:lat/:long", (req, res) => {
  var lat = req.params.lat.replace(":", "");
  var long = req.params.long.replace(":", "");
  let temp = indexHTML.replace(/"{%LAT%}"/g, lat);
  temp = temp.replace(/"{%LONG%}"/g, long);
  res.writeHead(200, {
    "Content-type": "text/html",
  });
  res.end(temp);
});

app.listen(8080, () => {
  console.log("3000");
});
