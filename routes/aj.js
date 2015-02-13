var express = require('express');
var router = express.Router();

// Show AJ Usage
router.get('/', function(req, res) {
    res.render('aj_usage', { title: 'Usage' });
});

var g_currentId = 0;
var g_items = [];

// List operation
router.get('/list/?:fromId([0-9]+)?', function(req, res) {
    var fromId = 0;
    if (req.params.fromId)
        fromId = req.params.fromId;

    var body = "";
    for (var i = 0; i < g_items.length; i++) {
        if (g_items[i].id >= fromId) {
            body += g_items[i].id.toString();
            body += "=";
            body += g_items[i].data;
            body += "\n";
        }
    }

    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
});

// Add operation
router.get('/add/:data', function(req, res) {
    var item = req.params.data;
    if (item) {
        g_currentId++;
        g_items.push({id:g_currentId, data:item});
    }
    returnId(req, res);
});
router.post('/add', function(req, res) {
    if (req.body) {
		console.log(req.headers);
		console.log(req.body);
		var item = req.body.toString();
        g_currentId++;
        g_items.push({id:g_currentId, data:item});
    }
    returnId(req, res);
});

// RemoveAll operation
router.get('/removeall', function(req, res) {
    g_currentId = 0;
    g_items = [];
    returnId(req, res);
});

// ID operation
router.get('/id', returnId);

function returnId(req, res) {
    var body = g_currentId.toString();
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
}

module.exports = router;
