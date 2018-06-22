var express = require("express");
var router = express.Router();

/* GET guess API. */
router.get("/:lat/:long", function (req, res, next) {

	longitude = req.params.long;
	latitude = req.params.lat;


	res.send();

});

module.exports = router;
