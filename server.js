const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config.js');
const methodOverride = require('method-override');
const helmet = require('helmet');
const log = require('./log.js');

const app = express();

app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(express.static(__dirname));


app.use(function onError(err, req, res, next) {
  res.status(500).send(err);
});

app.get("/log/search/:id", function(req, res) {
  log.getSearchLogByUserId(req.params.id, function(err, logs){
      if(err) res.status(500).send(err);
      else res.status(200).send(JSON.stringify(logs));
  });
});

app.post("/log/search", function(req, res) {
    log.addSearchLog(req.body, function(err, logs){
        if(err) res.status(500).send(err);
        else res.status(200).end();
    });
});

app.post("/log/login", function(req, res) {
    log.addLoginLog(req.body, function(err, logs){
        if(err) res.status(500).send(err);
        else res.status(200).end();
    });
});

app.get("/log/:id", function(req, res) {
    log.getAllLogs(function(err, logs){
        if(err) res.status(500).send(err);
        else res.status(200).send(JSON.stringify(logs));
    });
});

app.delete('/log/search/:id', function(req, res) {
  log.deleteAllSearchLogs(req.params.id, function(err){
      if(err) res.status(500).send(err);
      else res.status(200).end();
  });
});

app.delete('/log/:id', function(req, res) {
    log.deleteAllAuthLogs(function(err){
        if(err) res.status(500).send(err);
        else res.status(200).send();
    });
});

app.get('/logout/:id', function(req, res){
  log.addLogoutLog(req.params.id, function(err){
      if(err) res.status(500).send(err);
      else res.status(200).end();
  });
});

const server = http.createServer(app)
.listen(config.port, function(){ 
  console.log(`Example app listening on port ${config.port}!`)
});
