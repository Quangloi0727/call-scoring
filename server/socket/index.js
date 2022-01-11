

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`a user connected`);

    try {
      socket.on('disconnect', (data) => {
        console.log(`begin ------- data ------- disconnect`);
        console.log(data);
        console.log(`end ------- data ------- disconnect`);
      });
    } catch (error) {
      console.log(`begin ------- error ------- `);
      console.log(error);
      console.log(`end ------- error ------- `);
    }
  });

  return io;
};