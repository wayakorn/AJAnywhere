var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'index.js' });
});

router.get('/PlayTimeIsOver', function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end('{\n\"uid\": \"urn:uuid:feedbabe-feed-babe-food-foodfood0001\",\n\"updateDate\": "2017-01-25T00:00:00.0Z\",\n\"titleText\": \"Play Time Is Over Feed\",\n\"mainText": \"Play time is over, boys.\"\n}');
});

module.exports = router;
