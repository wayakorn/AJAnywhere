var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'index.js' });
});

var g_PlayTimeIsOverText = "Play time is over, boys.";

function writePlayTimeIsOver(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  var body = '{\n\"uid\": \"urn:uuid:feedbabe-feed-babe-food-foodfood0001\",\n\"updateDate\": "2017-01-25T00:00:00.0Z\",\n\"titleText\": \"Play Time Is Over Feed\",\n\"mainText": \"';
  body += g_PlayTimeIsOverText;
  body += '\"\n}';
  res.end(body);
}

router.get('/PlayTimeIsOver', function(req, res) {
  writePlayTimeIsOver(req, res);
});

router.get('/PlayTimeIsOver/:textt', function(req, res) {
  if (req.params.textt && req.params.textt != "") {
    g_PlayTimeIsOverText = req.params.textt.toString();
  }
  writePlayTimeIsOver(req, res);
});

module.exports = router;
