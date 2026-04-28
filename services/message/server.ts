import { Server } from "socket.io"
import { userSocketMap } from "../user/server";
import { messageGraph } from "../feed/server";


const io = new Server(3000, {
  cors: { origin: "*" }
});

const messages = io.of("/messages");

messages.on("connection", (socket) => {
  socket.on("message:send", ({ from, to, text }) => {
    const targetSocketId = userSocketMap.get(to);
    const senderSocketId = userSocketMap.get(from);

    if(!senderSocketId) return
    if(!targetSocketId) return

    const message = {
      from,
      to,
      text,
      timestamp: Date.now()
    };

    // send to recipient ONLY
    if (targetSocketId) {
      io.to(targetSocketId).emit("message:new", message);
    }

    registerInteraction(senderSocketId, targetSocketId)

    // also send back to sender (so they see it instantly)
    socket.emit("message:new", message);
  });
});

function registerInteraction(a: string, b: string) {
  if (!messageGraph.has(a)) messageGraph.set(a, new Set());
  if (!messageGraph.has(b)) messageGraph.set(b, new Set());

  messageGraph.get(a)!.add(b);
  messageGraph.get(b)!.add(a);
}