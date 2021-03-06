//Description: Scoring application to define statefulness of a system

var express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    scoring = require('./handlers/scoring.js'),
    responseTime = require('response-time'),
    cookieParser = require('cookie-parser'),
    path = require('path');


//initilizing Express
var app = express();

var memoryStore = "loveme";
//enabling logging
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/node.log'), {
    flags: 'a'
})

//enabling tracking components for express
app.use(morgan('dev', {
        stream: accessLogStream
    }))
    .use(cookieParser())
    .use(responseTime())

//static content declaration
app.use(express.static(__dirname + "/../static"));

//dynamic content declaration
//when defining this I could have use the default express module for session handler + storage
//but it is not as flexible as I want it to be\
app.get('/v1/statescore.json', scoring.incomingConnectionHandler);

app.get('/', function(req, res) {
    res.redirect("/index.html");
    res.end();
});

app.get('/index.html', function(req, res) {
    //reads the local page and sends that as reply
    var page = req.params.page_name;
    fs.readFile(
        'index.html',
        function(err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
            contents = contents.toString('utf8');
            //DEBUG : if an env variable has been set, this is used as hostname otherwise it falls to the default
            // hostname for the app
            if (process.env.PUBLICHOSTNAME) {
                contents = contents.replace(/REPLACEME/g, process.env.PUBLICHOSTNAME);
            } else {
                contents = contents.replace(/REPLACEME/g, "statescore.s10lab.net");
            }
//trying to disable client-side caching to avoid inconsistent behaviour
            res.writeHead(200, {
                "Content-Type": "text/html",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma" : "no-cache",
                "Expires": "0"
            });
            res.end(contents);
        }
    );
});

app.get('/loaderio-936d844c6d888c77527eba215d1f13a6.html', function(req, res) {
    //reads the local page and sends that as reply
            contents = "loaderio-936d844c6d888c77527eba215d1f13a6";
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(contents);
        }
    );



app.get('/admin.html', function(req, res) {
    //reads the local page and sends that as reply
    var page = req.params.page_name;
    fs.readFile(
        'admin.html',
        function(err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
            contents = contents.toString('utf8');
            //DEBUG : if an env variable has been set, this is used as hostname otherwise it falls to the default
            // hostname for the app
            if (process.env.PUBLICHOSTNAME) {
                contents = contents.replace(/REPLACEME/g, process.env.PUBLICHOSTNAME);
            } else {
                contents = contents.replace(/REPLACEME/g, "statescore.s10lab.net");
            }
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(contents);
        }
    );
});
//handling admin commands
app.get('/admin', function(req, res) {
    scoring.memoryStoreManager(req, res, function(err) {
        if (err) {
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            res.end("ADMIN CODE NOT FOUND 404");
            return;
        }
        res.writeHead(200, {
            "Content-Type": "text/html"
        })
        res.end("success");
    });
});
//general redirect
app.get("*", function(req, res) {
    res.writeHead(404, {
        "Content-Type": "text/html"
    });
    res.end("RESOURCE NOT FOUND 404");

});
//listening to port 80 *may require root on machine*
app.listen(80);
