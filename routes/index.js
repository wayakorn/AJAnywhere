var moment = require('moment');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'index.js' });
});

var g_PlayTimeIsOverText = "Play time is over, boys.";

function writePlayTimeIsOver(req, res) {
  var updated = moment().subtract(1, 'hour').toISOString();
  var body = '{\n\"uid\": \"urn:uuid:feedbabe-feed-babe-food-foodfood0001\"\n';
  body += '\"updateDate\": \"' + updated;
  body += '\",\n';
  body += '\"titleText\": \"PTO Feed\",\n\"mainText": \"';
  body += g_PlayTimeIsOverText;
  body += '\"\n}\n\n';

  res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
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

var g_printers = [];
var g_notifyCount = 0;

function FindPrinter(socket, remove) {
    var result = null;
    var printers = [];
    for (var i = 0; i < g_printers.length; ++i) {
        if (socket == g_printers[i].Sock) {
            result = g_printers[i];
            if (!remove) {
                break;
            }
        } else {
            printers.push(g_printers[i]);
        }
    }
    if (remove) {
        g_printers = printers;
    }
    return result;
};

function DoNotify(req, res) {
    var httpStatus;
    var body;
	if (g_printers.length > 0) {
		body = "Notifying " + g_printers.length + " printers...";
        for (var i = 0; i < g_printers.length; ++i) {
            ++g_notifyCount;
            g_printers[i].Res.writeHead(200, {"Content-Type": "text/plain"});
            g_printers[i].Res.end(g_notifyCount.toString());
        }
		g_printers = [];
	} else {
		body = "No printer currently waiting.";
	}
    console.log(body);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(body);
};

// [PC] Get printer status
router.get('/mcp/status', function(req, res) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end("<html>There are currently <b>" + g_printers.length + "</b> printers waiting.</html>");
});

router.get('/mcp/notify', function(req, res) {
    DoNotify(req, res);
});

router.put('/mcp/notify', function(req, res) {
    DoNotify(req, res);
});

// [Printer] Wait for print job 
router.get('/mcp/wait', function(req, res) {
    console.log("[Printer] connected @ " + req.socket);
    var printer = FindPrinter(req.socket, false);
    if (printer != null) {
        printer.Res = res;
        printer.Sock = req.socket;
    } else {
        // New printer, add it into the list
        printer = {Res: res, Sock: req.socket};
        g_printers.push(printer);
    }

    // Schedule a cleanup if the HTTP connection is closed
    res.on('close', function(e) {
        console.log("[Printer] lost connection @ " + res.socket);
        var printer = FindPrinter(res.socket, true);
        if (printer != null) {
            console.log("  removed from list");
        }
    });
});
