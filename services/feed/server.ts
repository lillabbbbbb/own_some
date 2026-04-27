import { Server } from "socket.io";

const io = new Server(4002, { cors: { origin: "*" } });

const posts: any[] = [];

io.on("connection", (socket) => {

  socket.on("post:create", (post) => {
    const fullPost = {
      ...post,
      id: posts.length,
      timestamp: Date.now(),
      comments: []
    };

    posts.unshift(fullPost);

    // emit to feed
    io.emit("post:new", fullPost);

    // ALSO index into search service (simple event propagation)
    io.emit("index:post", fullPost);
  });

});