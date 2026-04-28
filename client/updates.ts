import { sockets } from "./gateway";

sockets.posts.on("post:new", (post) => {
  console.log("\n🆕 NEW POST");
  console.log(post.text);
});

sockets.messages.on("message:new", (msg) => {
  console.log(`\n💬 ${msg.from}: ${msg.text}`);
});

sockets.comments.on("comment:new", ({ postId, comment }) => {
  console.log("\n💭 NEW COMMENT");
  console.log(`Post ${postId}`);
  console.log(`${comment.user}: ${comment.text}`);
});