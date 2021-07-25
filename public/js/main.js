const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from url
var url_string = window.location.href;
var url = new URL(url_string);
const username = url.searchParams.get("username");
const room = url.searchParams.get("room");



const socket = io();

//join chatroom
socket.emit('joinRoom', {username,room});

//get room and users
socket.on('roomusers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
}); 

//messsage from server
socket.on('message', message =>{
    console.log(message);
    outputmessage(message);

    //scroll down msg
    chatMessages.scrollTop= chatMessages.scrollHeight;
})

//message submit
chatform.addEventListener('submit',(e)=>{   //e - event parameter
    e.preventDefault(); //preventing from submitting to a file

    //get msg text
    const msg = e.target.elements.msg.value; //get the msg


    //emit msg to server
    socket.emit('chatMessage',msg);

    //clear enter input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

//output message to DOM
function outputmessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = '<p class="meta"> ' +message.username+' </p><p class="text"> '+ message.text +'<\p>';

    document.querySelector('.chat-messages').appendChild(div);
}


//add room name to DOM
function outputRoomName(room){
  roomName.innerText = room;
}

//add user to DOM
function outputUsers(users){
    userList.innerHTML=`${users.map(user => `<li>${user.username}</li>`).join('')}`;
}