const path = require('path');
const http = require('http');
const express = require('express');  //bring express server
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin , getCurrentUser,userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname,'public')));  //add public as static folder


//run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room})=> {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //welcome current user
        socket.emit('message',formatMessage('Bot',`Welcome <b > ${user.username} </b> `)); //store in message and send to main.js

        //broadcast when a user connects
        //const joinedMsg = user.username +' joined';
        //socket.broadcast.to(user.room).emit('message',formatMessage('Bot',joinedMsg)); //says to everyone expect user connecting
        
        //send users and room info
        io.to(user.room).emit('roomusers',{
            room : user.room,
            users : getRoomUsers(user.room)
        });
        
    });
    
    //io.emit(); //to all clients in general


    //listen for chatmesssage
    socket.on('chatMessage', msg=> {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username, msg));
    });

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user=userLeave(socket.id);
        
        if(user){
            //const name = user.username +' left';
            //io.to(user.room).emit('message',formatMessage('Bot',name));
            
            //after disconnect - send users and room info

            io.to(user.room).emit('roomusers',{
                 room : user.room,
                users : getRoomUsers(user.room)
            });

        }

        
 
    });


});

const PORT = 3000 || process.env.PORT; //process environment port already preset
server.listen(PORT, () => console.log(`Server running in ${PORT}`));