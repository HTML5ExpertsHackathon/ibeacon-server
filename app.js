var http = require('http');
var router = require('http-router');
var routes = new router();
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var qs = require('querystring');

routes
  .post('/', function(req, res, next) {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var type = req.headers['content-type'];
      if (/application\/x-www-form-urlencoded/.test(type)) {
        data = JSON.stringify(qs.parse(data));
      }

      emitter.emit('data', data);
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      res.end();
    });
  })
  .get('/', function(req, res, next) {
    if (req.headers['accept'] !== 'text/event-stream') return res.end('');

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    var timer = setInterval(function() {
      res.write(':');
    }, 5000);

    emitter.on('data', function(data) {
      res.write('data: ' + data + '\n\n');
    });

    req.on('close', function() {
      clearTimeout(timer);
    });
  });

http.createServer(function(req, res) {
  if (!routes.route(req, res)) {
    res.writeHead(500);
    res.end('Error');
  }
}).listen(process.env.PORT || 8080);
