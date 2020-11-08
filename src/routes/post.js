var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.get("/populate", urlencodedParser, function (req, res, next) {
  res.send("fuckyou");
});

module.exports = router;
