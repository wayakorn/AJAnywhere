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
var g_waitingPrinter = null;

// [PC] Get printer status
router.get('/mcp/status', function(req, res) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');

    var body = "<html>Printer is <b>";
	if (g_waitingPrinter) {
		body += "online @ "
		body += g_waitingPrinter.Addr;
	} else {
		body += "offline"
	}
	body += "</b>.";
    res.end(body + '</html>\n');
});

function SubmitJob(req, res, customText) {
	if (customText == null) {
		customText = "(empty text)";
	}

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');

    var body = "<html>";
	if (g_waitingPrinter) {
		var jobId = ++g_currentJobId;
		
		console.log("[Printer] Sending job " + jobId + " to printer @ ", g_waitingPrinter.Addr);

		body += "Submitted print job " + jobId.toString() + " @ " + g_waitingPrinter.Addr;

		g_waitingPrinter.Res.setHeader('content-type', 'text/plain; charset=utf-8');
		g_waitingPrinter.Res.setHeader('cache-control', 'no-cache');
		var printerResponseBody = "Wait returned - print job ";
		printerResponseBody += jobId.toString();
		printerResponseBody += " arrived the printer. Text: ";
		printerResponseBody += customText;
		g_waitingPrinter.Res.end(printerResponseBody);
		g_waitingPrinter = null;
	} else {
		body += "Print job <b>not</b> submitted - printer is offline."
	}
	body += ".";
    res.end(body + '</html>\n');
};

// [PC] Submit print job (GET, without custom text)
router.get('/mcp/submitjob', function(req, res) {
	SubmitJob(req, res, null);
});

// [PC] Submit print job (GET, with custom text)
router.get('/mcp/submitjob/:data', function(req, res) {
	SubmitJob(req, res, req.params.data);
});

router.get('/mcp/submitjob/:data', function(req, res) {
    var user = req.params.user;
    addUser(user);
    var item = req.params.data;
    addCommon(req, res, user, item);
});


// [Printer] Wait for print job 
router.get('/mcp/printer/waitforjob', function(req, res) {
	g_waitingPrinter = {Res: res, Addr: req.socket.remoteAddress};
	console.log("[Printer] connected @ ", req.socket.remoteAddress);
	res.on('close', function(e) {
		console.log("[Printer] lost connection @ " + g_waitingPrinter.Addr);
		g_waitingPrinter = null;
	});
});

