var express = require('express');
var router = express.Router();

// Show AJ Usage
router.get('/', function(req, res) {
    res.render('aj_usage', { title: 'Usage' });
});


function returnNumber(req, res, id) {
    var body = id.toString();
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
}


var g_currentId = [];
var g_items = [];

// List operation
router.get('/:user/list/?:fromId([0-9]+)?', function(req, res) {
    var body = "";
    if (req.params.user) {
        var user = req.params.user;
        var fromId = 0;
        if (req.params.fromId)
            fromId = req.params.fromId;
        if (!g_items[user])
            g_items[user] = [];
        for (var i = 0; i < g_items[user].length; i++) {
            if (g_items[user][i].id >= fromId) {
                body += g_items[user][i].id.toString();
                body += "=";
                body += g_items[user][i].data;
                body += "\n";
            }
        }
    }
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
});

// Add operation (GET)
router.get('/:user/add/:data', function(req, res) {
    var user = req.params.user;
    var item = req.params.data;
    addCommon(req, res, user, item);
});

// Add operation (POST)
router.post('/:user/add', function(req, res) {
    var user = req.params.user;
    var item = null;
    if (req.body) {
        console.log(req.headers);
        console.log(req.body);
        item = req.body.toString();
    }
    addCommon(req, res, user, item);
});

function addCommon(req, res, user, item) {
    console.log("user=" + user);
    console.log("item=" + item);

    if (user && item) {
        if (!g_currentId[user])
            g_currentId[user] = 0;
        g_currentId[user]++;
        if (!g_items[user])
            g_items[user] = [];
        g_items[user].push({id:g_currentId[user], data:item});
        if (!g_currentId[user])
            g_currentId[user] = 0;
        returnNumber(req, res, g_currentId[user]);
    } else {
        returnNumber(req, res, 0);
    }
}

// RemoveAll operation
router.get('/:user/removeall', function(req, res) {
    if (!req.params.user) {
        returnNumber(req, res, 0);
    } else {
        var user = req.params.user;
        g_currentId[user] = 0;
        g_items[user] = [];
        returnNumber(req, res, g_currentId[user]);
    }
});

// ID operation
router.get('/:user/id', function(req, res) {
    if (!req.params.user) {
        returnNumber(req, res, 0);
    } else {
        var user = req.params.user;
        if (!g_currentId[user])
            g_currentId[user] = 0;
        returnNumber(req, res, g_currentId[user]);
    }
});


//
// Schema functions
//

// Current schema version
var g_currentSchemaVersion = [];

// This is an array of dictionary objects; we'll store items as properties, 
// with "s_keys" property being the master list of all keys, which
// is useful for enumerating items.
var g_schemas = [];

// Schema update operation (GET)
router.get('/:user/s_updateget/:key/:value', function(req, res) {
    var user = req.params.user;
    var key = req.params.key;
    var value = req.params.value;
    s_updateCommon(req, res, user, key, value);
});

// Schema update operation (POST)  was '/s_update/:key'
router.post(/\/(.+)\/s_updatepost\/(.+)/, function(req, res) {
    if (req.body) {
        console.log(req.headers);
    }
    var user = req.params[0];
    var key = req.params[1];
    var value = req.body;
    s_updateCommon(req, res, user, key, value);
});

function s_updateCommon(req, res, user, key, value) {
    console.log("user=" + user);
    console.log("k=" + key);
    console.log("v=" + value);
    
    if (user && key && value) {
        if (!g_schemas[user]) {
            g_schemas[user] = {};
            g_schemas[user]['s_keys'] = [];
        }
        var keys = g_schemas[user]['s_keys'];
        if (keys.length == 0 || g_schemas[user][key] != value) {
            if (keys.indexOf(key) == -1) {
                keys.push(key);
                console.log("added k/v, total=" + keys.length.toString());
            } else {
                console.log("value was " + g_schemas[user][key]);
                console.log("updating value, total=" + keys.length.toString());
            }
            g_schemas[user][key] = value;
            if (!g_currentSchemaVersion[user])
                g_currentSchemaVersion[user] = 0;
            g_currentSchemaVersion[user]++;
        }
        if (!g_currentSchemaVersion[user])
            g_currentSchemaVersion[user] = 0;
        returnNumber(req, res, g_currentSchemaVersion[user]);
    } else {
        returnNumber(req, res, 0);
    }
}

// Schema list operation
router.get('/:user/s_list', function(req, res) {
    var body = "";
    if (!req.params.user) {
        returnNumber(req, res, 0);
    } else {
        var user = req.params.user;
        if (!g_schemas[user]) {
            g_schemas[user] = {};
            g_schemas[user]['s_keys'] = [];
        }
        var keys = g_schemas[user]['s_keys'];
        console.log("count=" + keys.length);
        for (var i = 0; i < keys.length; i++) {
            body += "k=" + keys[i];
            body += "\n";
            body += "v=" + g_schemas[user][keys[i].toString()];
            body += "\n\n";
        }
    }
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-cache');
    res.end(body + '\n\n');
});

// Schema removeall operation
router.get('/:user/s_removeall', function(req, res) {
    if (!req.params.user) {
        returnNumber(req, res, 0);
    } else {
        var user = req.params.user;
        if (!g_currentSchemaVersion[user])
            g_currentSchemaVersion[user] = 0;
        g_currentSchemaVersion[user]++;
        if (!g_schemas[user]) {
            g_schemas[user] = {};
        }
        g_schemas[user]['s_keys'] = [];
        returnNumber(req, res, g_currentSchemaVersion[user]);
    }
});

// Schema get ID operation
router.get('/:user/s_id', function(req, res) {
    if (!req.params.user) {
        returnNumber(req, res, 0);
    } else {
        var user = req.params.user;
        if (!g_currentSchemaVersion[user])
            g_currentSchemaVersion[user] = 0;
        returnNumber(req, res, g_currentSchemaVersion[user]);
    }
});


module.exports = router;
