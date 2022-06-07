const socket = require("socket.io");

let io;
module.exports = {
  initIo: (httpServer) => {
    io = socket(httpServer);
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Connection to socket.io faild!");
    }
    return io;
  },
};
