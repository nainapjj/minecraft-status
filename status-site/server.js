var pty = require('pty');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var password = "password";
var app = express();

app.use(cors());
app.disable('etag');
app.use(bodyParser.json());

app.get('/status', function(req, res) {
	var term = pty.spawn('bash', [], {
  	  name: 'xterm-color',
	  cols: 80,
	  rows: 30,
	  cwd: process.env.HOME,
	  env: process.env
	});

	var processOn = false;
	var originalProcess = false;

	term.on('data', function(data) {
  		if (data.search('minecraft') != -1) {
  			processOn = true;
  		} else if (data.search('devel-server') != -1) {
  			if (!originalProcess) {originalProcess = true}
			else {res.json({"running": processOn})}
  		}
		console.log(data);
	});

	term.write("ps aux | grep java | grep -v grep\r")
});

app.post('/stop', function(req, res) {
	if (req.body.password != password) {
		res.json({"status": false});
	} else {
	var term = pty.spawn('bash', [], {
  	  name: 'xterm-color',
	  cols: 80,
	  rows: 30,
	  cwd: process.env.HOME,
	  env: process.env
	});

	 term.on('data', function(data) {
                console.log(data);
        });


	term.write('screen -r 4135\r');
	setTimeout(function() {term.write("\003\003\r")}, 100);
	setTimeout(function() {term.write('\001d\r')}, 200);

	setTimeout(function() {res.json({"status": true})}, 300);
	}
});

app.post('/start', function(req, res) {
	if (req.body.password != password) {
                res.json({"status": false});
        } else {
	var term = pty.spawn('bash', [], {
  	  name: 'xterm-color',
	  cols: 80,
	  rows: 30,
	  cwd: process.env.HOME,
	  env: process.env
	});

         term.on('data', function(data) {
                console.log(data);
        });

	term.write('screen -r 4135\r');
	setTimeout(function() {term.write("java -jar minecraft_server.1.8.9.jar nogui\r")}, 100);
	setTimeout(function() {term.write('\001d\r')}, 200);

	setTimeout(function() {res.json({"status": true})}, 300);}
});

var server = app.listen(5555, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Status app listening at http://%s:%s', host, port);
});
