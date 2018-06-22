var express = require("express");
var router = express.Router();

const version = "0.1";

/* GET main page. */
router.get("/:round", function(req, res, next) {


  res.render("index", { title: `Vehicle Guesser v${version}` });

});

module.exports = router;
