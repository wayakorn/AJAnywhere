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








router.get('/mcp', function(req, res) {
  res.render('mcp_usage', { title: 'MCP Usage' });
});


var g_currentJobId = 0;
var g_hangingRes = null;

// [PC] Get printer status
router.get('/mcp/status', function(req, res) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');

    var body = "<html>Printer is <b>";
	if (g_hangingRes) {
		body += "online"
	} else {
		body += "offline"
	}
	body += "</b>.";
    res.end(body + '</html>\n');
});

// [PC] Submit print job
router.get('/mcp/submitjob', function(req, res) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');

    var body = "<html>";
	if (g_hangingRes) {
		var jobId = ++g_currentJobId;
		
		g_hangingRes.setHeader('content-type', 'text/plain; charset=utf-8');
		g_hangingRes.setHeader('cache-control', 'no-cache');
		var printerResponseBody = "Wait returned - print job ";
		printerResponseBody += jobId.toString();
		printerResponseBody += " arrived the printer.";
		g_hangingRes.end(printerResponseBody);
		g_hangingRes = null;

		body += "Submitted print job " + jobId.toString() + "!";
	} else {
		body += "Print job <b>not</b> submitted - printer is offline."
	}
	body += ".";
    res.end(body + '</html>\n');
});

// [Printer] Wait for print job 
router.get('/mcp/printer/waitforjob', function(req, res) {
	g_hangingRes = res;
	g_hangingRes.on('close', function(e) {
		console.log("### resetting g_hangingRes due to error: " + e);
		g_hangingRes = null;
	});
});

