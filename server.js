const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

server.listen(8080);

app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = [];

io.on("connection", (socket) => {

  //cirando um listener
  socket.on("join-request", (username) => {
    socket.username = username;
    connectedUsers.push(username);
    socket.emit("user-ok", connectedUsers);

    //msg para todas as conexoes menos a propria conexao;
    socket.broadcast.emit("list-update", {
      joined: username,
      list: connectedUsers,
    });
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((user) => user != socket.username);

    socket.broadcast.emit('list-update', {
       left: socket.username,
       list: connectedUsers
    })

  });


  socket.on('send-msg', (txt)=>{
    let obj = {
        username : socket.username,
        msg: txt
    }

    socket.emit('show-msg', obj);
    socket.broadcast.emit('show-msg', obj)

  })
});
