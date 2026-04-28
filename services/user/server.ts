import { Server } from "socket.io";

const io = new Server(4001, { cors: { origin: "*" } });

export const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {

  // LOGIN / SIGNUP
  socket.on("user:login", ({ name }) => {

    socket.data.user = name;

    userSocketMap.set(name, socket.id);
    
    socket.emit("user:login:success", userSocketMap.get(name));
  });

  // GET PROFILE
  socket.on("user:get", (name) => {
    socket.emit("user:data", userSocketMap.get(name) || null);
  });

  // UPDATE NAME
  socket.on("user:rename", ({ oldName, newName }) => {
    const user = userSocketMap.get(oldName);
    if (!user) return;

    userSocketMap.delete(oldName);
    userSocketMap.set(newName, user);

    io.emit("user:updated", user);
  });


  socket.on("disconnect", () => {
    for (const [user, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(user);
        break;
      }
    }
  });

});