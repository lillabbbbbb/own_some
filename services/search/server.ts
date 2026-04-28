import { Server } from "socket.io";

const io = new Server(4004, { cors: { origin: "*" } });

const postsIndex: any[] = [];
const usersIndex: any[] = [];

io.on("connection", (socket) => {

  // INDEX POSTS
  socket.on("index:post", (post) => {
    postsIndex.push(post);
  });

  // INDEX USERS
  socket.on("index:user", (user) => {
    usersIndex.push(user);
  });

  // SEARCH
  socket.on("search", (query: string) => {

    const q = query.toLowerCase();

    const users = usersIndex.filter(u =>
      u.name.toLowerCase().includes(q)
    );

    const posts = postsIndex.filter(p =>
      p.text.toLowerCase().includes(q)
    );

    socket.emit("search:result", {
      users,
      posts
    });
  });
});