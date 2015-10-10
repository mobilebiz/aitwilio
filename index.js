var express = require('express')
  , bodyParser = require('body-parser')
  , config = require('config')
  , twilio = require('twilio')
  , sio = require('./routes/sio')
  , twi = require('./routes/twi')
;

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// 発信ページの表示
app.get('/', function(request, response) {
  response.render('pages/index', {
    title: 'AiTwilio'
  });
});

// ガイダンス（TwiML）を返す
app.post('/guidance', function(request, response) {
  twi.guidance(function(err, twiml) {
    if (err) {
      response.sendStatus(500);
    } else {
      response.type('text/xml');
      response.send(twiml);
    }
  });
});

// ステータスの変化時にTwilioからコールされる
app.post('/statusCallback', function(request, response) {
  response.setHeader('Content-Type', 'text/plain');
  twi.statusCallback(request.body, function(err) {
    if (err) {
      response.sendStatus(500);
    } else {
      response.sendStatus(200);
    }
  });
});

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

sio(server);
