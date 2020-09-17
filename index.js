var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = [];
var sockets = [];
const fs = require('fs');

app.get('/', function(req, res){ 
  res.sendFile(__dirname + '/index.html');
});

app.get('/history-*', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,      Accept");
  console.log(req.url.split("-"))
  res.sendFile(__dirname + '/history-'+req.url.split("-")[req.url.split("-").length-1]+'.txt');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    if(msg != null){
      io.emit('chat message', msg);
      fs.appendFile('history.txt', msg+"\n", function (err) {
        if (err) throw err;
        console.log("Added: ''"+msg+"'' to history");
      });
    }
  });
  socket.on('connected', function(nick){
    if(nick != null){
      sockets.push(socket)
      users.push(nick);
      fs.appendFile('history-main.txt', nick.toUpperCase()+" CONNECTED"+"\n", function (err) {
        if (err) throw err;
        console.log("Added: ''"+nick.toUpperCase()+"'' to history");
      });
      io.emit('chat message', nick.toUpperCase()+" CONNECTED");
    }
  });

  socket.on('disconnect', function(){
    var i = sockets.indexOf(socket)
    delete sockets[i]
    if(users[i] != null){
      io.emit('chat message', users[i].toUpperCase()+" DISCONNECTED");
      delete users[i]
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
