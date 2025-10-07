const express = require('express');
const bodyParser = require('body-parser');
const {server} = require('socket.io');

const io = new server();
const app = express();

app.use(bodyParser.json());

io.on('connection', (socket) => {
    socket.on('joinMeeting', (data) => {
        const {meetingID, userName} = data;
        socket.join(meetingID);
        socket.broadcast.to(meetingID).emit('userJoined', {userName, message: `${userName} has joined the meeting.`});
    });
});

app.listen(3000, () => console.log('Server is running on port 3000...'));
io.listen(4000, () => console.log('Socket.IO server is running on port 4000...'));
