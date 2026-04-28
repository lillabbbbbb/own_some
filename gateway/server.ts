import { createServer } from "http";
import { Server } from "socket.io";

import { registerPostGateway } from "./routes/posts.gateway";
import { registerMessageGateway } from "./routes/messages.gateway";
import { registerUserGateway } from "./routes/users.gateway";
import { registerFeedGateway } from "./routes/feed.gateway";
import { registerSearchGateway } from "./routes/search.gateway";
import { registerCommentGateway } from "./routes/comments.gateway";

const httpServer = createServer();

export const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected");

  registerUserGateway(io, socket);
  registerSearchGateway(io, socket);
  registerPostGateway(io, socket);
  registerMessageGateway(io, socket);
  registerFeedGateway(io, socket);
  registerCommentGateway(io, socket)
});

httpServer.listen(4000, () => {
  console.log("Gateway running on port 4000");
});