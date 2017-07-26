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
var g_printQueue = new Array();

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
	body += "</b>.<br>";
    body += "There are " + g_printQueue.length + " jobs waiting to be printed.";
    res.end(body + "</html>\n");
});

function SubmitJob(req, res, filename) {
	if (filename == null) {
		filename = "download.xps";
	}

    // Queue the job
    var jobId = ++g_currentJobId;
    var resourceUrl = "http://mycps.azurewebsites.net/api/download/?filename=" + filename;
    g_printQueue.push({JobId: jobId, ResourceUrl: resourceUrl});
    console.log("[Queue] Queued job " + jobId + ", resourceUrl=" + resourceUrl);

    var httpStatus = 200;
    var body = "";
	if (g_waitingPrinter) {
        // Pop it out from the queue and send it to the printer
        var job = g_printQueue.shift();
        body += "Print job " + job.JobId + " sent to printer @ " + g_waitingPrinter.Addr + ", resourceUrl:\r\n" + job.ResourceUrl;
        SendPrintJob(job, g_waitingPrinter);
		g_waitingPrinter = null;
	} else {
        httpStatus = 204;
		body += "Print job queued, waiting for a printer to pick up. " + "Currently there are " + g_printQueue.length + " job(s) in the queue.";
	}
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(body);
};

// [PC] Submit print job (GET, without resourceUrl)
router.get('/mcp/submitjob', function(req, res) {
	SubmitJob(req, res, null);
});

// [PC] Submit print job (GET, with resourceUrl)
router.get('/mcp/submitjob/:data', function(req, res) {
	SubmitJob(req, res, req.params.data);
});

// [PC] Submit print job (POST, with resourceUrl)
router.get('/mcp/submitjob/:data', function(req, res) {
    var user = req.params.user;
    addUser(user);
    var item = req.params.data;
    addCommon(req, res, user, item);
});

function SendPrintJob(job, printer) {
    jobId = job.JobId;
    resourceUrl = job.ResourceUrl;
    console.log("[Printer] Sending job " + job.JobId + " to printer @ " + printer.Addr + ", resourceUrl=" + job.ResourceUrl);
    printer.Res.writeHead(200, {"Content-Type": "text/plain"});
    printer.Res.end(resourceUrl);
}

// [Printer] Wait for print job 
router.get('/mcp/printer/waitforjob', function(req, res) {
    console.log("[Printer] connected @ " + req.socket.remoteAddress);
    var printer = {Res: res, Addr: req.socket.remoteAddress};
    if (g_printQueue.length > 0) {
        SendPrintJob(g_printQueue.shift(), printer);
    } else {
        // If the queue is empty, make the printer wait for job
        g_waitingPrinter = printer;
        res.on('close', function(e) {
            console.log("[Printer] lost connection @ " + g_waitingPrinter.Addr);
            g_waitingPrinter = null;
        });
    }
});

