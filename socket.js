const { Server } = require('socket.io');
let IO;

module.exports.initIO = (httpServer) => {
    IO = new Server(httpServer);

    IO.use((socket, next) => {
        if (socket.handshake.query) {
            let userName = socket.handshake.query.name
            socket.user = userName;
            next();
        }
    })

    IO.on('connection', (socket) => {
        console.log(socket.user, "Connected");
        socket.join(socket.user);

        socket.on('call', (data) => {
            let callee = data.name;
            let rtcMessage = data.rtcMessage;

            socket.to(callee).emit("newCall", {
                caller: socket.user,
                rtcMessage: rtcMessage
            })

        })

        socket.on('answerCall', (data) => {
            let caller = data.caller;
            rtcMessage = data.rtcMessage

            socket.to(caller).emit("callAnswered", {
                callee: socket.user,
                rtcMessage: rtcMessage
            })

        })

        socket.on('ICEcandidate', (data) => {
            let otherUser = data.user;
            let rtcMessage = data.rtcMessage;

            socket.to(otherUser).emit("ICEcandidate", {
                sender: socket.user,
                rtcMessage: rtcMessage
            })
        })
    })
}

module.exports.getIO = () => {
    if (!IO) {
        throw Error("IO not initilized.")
    } else {
        return IO;
    }
}