import { io } from "socket.io-client";

export const sockets = {
  users: io("http://localhost:4001/users"),
  posts: io("http://localhost:4002/posts"),
  messages: io("http://localhost:4003/messages"),
  comments: io("http://localhost:4004/comments"),
  search: io("http://localhost:4005/search")
};