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

// Add operation (GET)
router.get('/add/:data', function(req, res) {
    var item = req.params.data;
    if (item) {
        g_currentId++;
        g_items.push({id:g_currentId, data:item});
    }
    returnId(req, res);
});

// Add operation (POST)
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


//
// Schema functions
//

// Current schema version
var g_currentSVersion = 0;

// This is our dictionary object; we'll store items as properties, 
// with "s_keys" property being the master list of all keys, which
// is useful for enumerating items.
var g_schemas = {}; 
g_schemas['s_keys'] = [];

// Schema update operation (GET)
router.get('/s_updateget/:key/:value', function(req, res) {
    var key = req.params.key;
	var value = req.params.value;
	console.log("k=" + key);
	console.log("v=" + value);
    if (key && value) {
		var keys = g_schemas['s_keys'];
		if (keys.length == 0 || g_schemas[key] != value) {
			if (keys.indexOf(key) == -1) {
				keys.push(key);
				console.log("added k/v, total=" + keys.length.toString());
			} else {
				console.log("value was " + g_schemas[key]);
				console.log("updating value, total=" + keys.length.toString());
			}
			g_schemas[key] = value;
			g_currentSVersion++;
		}
    }
    returnSVersion(req, res);
});

// Schema update operation (POST)  was '/s_update/:key'
router.post(/\/s_updatepost\/(.+)/, function(req, res) {
    if (req.body) {
		console.log(req.headers);
	}
    var key = req.params[0];
	var value = req.body;
	console.log("k=" + key);
	console.log("v=" + value);
	if (key && value) {
		var keys = g_schemas['s_keys'];
		if (keys.length == 0 || g_schemas[key] != value) {
			if (keys.indexOf(key) == -1) {
				keys.push(key);
				console.log("added k/v, total=" + keys.length.toString());
			} else {
				console.log("value was " + g_schemas[key]);
				console.log("updating value, total=" + keys.length.toString());
			}
			g_schemas[key] = value;
			g_currentSVersion++;
		}
	}
    returnSVersion(req, res);
});

// Schema list operation
router.get('/s_list', function(req, res) {
    var body = "";
	var keys = g_schemas['s_keys'];
	console.log("count=" + keys.length);
    for (var i = 0; i < keys.length; i++) {
		body += "k=" + keys[i];
		body += "\n";
		body += "v=" + g_schemas[keys[i].toString()];
		body += "\n\n";
    }

    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
});

// Schema removeall operation
router.get('/s_removeall', function(req, res) {
    g_currentSVersion++;
	g_schemas['s_keys'] = [];
    returnSVersion(req, res);
});

// Schema get ID operation
router.get('/s_id', returnSVersion)

function returnSVersion(req, res) {
    var body = g_currentSVersion.toString();
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
}


module.exports = router;
