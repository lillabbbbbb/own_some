import { Server } from "socket.io";

const io = new Server(4002, { cors: { origin: "*" } });

const posts: any[] = [];

// user -> Set of users they interacted with
export const messageGraph = new Map<string, Set<string>>();

function canUserSeePost(viewer: string, author: string) {
  return messageGraph.get(viewer)?.has(author);
}

io.on("connection", (socket) => {

  // -------------------------
  // USER REGISTRATION FOR FEED
  // -------------------------
  socket.on("feed:register", (user: string) => {
    socket.data.user = user;
  });

  // -------------------------
  // POST CREATE
  // -------------------------
  socket.on("post:create", (post) => {

    const fullPost = {
      ...post,
      id: posts.length,
      timestamp: Date.now(),
      comments: []
    };

    posts.unshift(fullPost);

    const author = fullPost.user;

    // broadcast ONLY to users who have interacted with author
    for (const [clientSocketId, clientSocket] of io.sockets.sockets) {
      const viewer = clientSocket.data.user;

      if (!viewer) continue;

      if (viewer === author || canUserSeePost(viewer, author)) {
        clientSocket.emit("post:new", fullPost);
      }
    }

    // still index for search service
    io.emit("index:post", fullPost);
  });

});