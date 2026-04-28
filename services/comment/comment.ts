import { sockets } from "../../client/gateway";
import { Comment, Post } from "../../shared/types";
import { Server } from "socket.io";

const io = new Server(4002, {
  cors: { origin: "*" }
});

const posts: Post[] = [];


function addReply(
  comments: Comment[],
  targetId: string,
  reply: Comment
): boolean {

  for (const c of comments) {

    if (c.id === targetId) {
      c.replies.push(reply);
      return true;
    }

    if (addReply(c.replies, targetId, reply)) {
      return true;
    }
  }

  return false;
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // -------------------------
  // CREATE POST
  // -------------------------
  socket.on("post:create", ({ user, text }) => {
    const post: Post = {
      id: crypto.randomUUID(),
      user,
      text,
      timestamp: Date.now(),
      comments: []
    };

    posts.unshift(post);

    io.emit("post:new", post);
  });

  // -------------------------
  // GET FEED SNAPSHOT (socket-based, NOT REST)
  // -------------------------
  socket.on("feed:subscribe", () => {
    socket.emit("feed:init", posts);
  });

  // -------------------------
  // ADD TOP-LEVEL COMMENT
  // -------------------------
  socket.on("comment:add", ({ postId, user, text }) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      user,
      text,
      timestamp: Date.now(),
      replies: []
    };

    post.comments.push(comment);

    io.emit("comment:new", {
      postId,
      comment
    });
  });

  // -------------------------
  // ADD NESTED REPLY
  // -------------------------
  socket.on(
    "comment:reply",
    ({ postId, parentCommentId, user, text }) => {

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const reply: Comment = {
        id: crypto.randomUUID(),
        user,
        text,
        timestamp: Date.now(),
        replies: []
      };

      const success = addReply(post.comments, parentCommentId, reply);

      if (!success) return;

      io.emit("comment:new", {
        postId,
        parentCommentId,
        comment: reply
      });
    }
  );

  // -------------------------
  // GET SINGLE POST (optional utility)
  // -------------------------
  socket.on("post:get", (postId) => {
    const post = posts.find(p => p.id === postId);
    socket.emit("post:data", post || null);
  });

  // -------------------------
  // DISCONNECT
  // -------------------------
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log("Posts service running on port 4002");