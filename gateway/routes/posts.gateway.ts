import { Server, Socket } from "socket.io";
import { createPost } from "../../services/post/post.service";
import { Events } from "../../shared/events";

export function registerPostGateway(io: Server, socket: Socket) {

  socket.on(Events.POST_CREATE, (data) => {
    const post = createPost(data);

    io.emit(Events.POST_CREATED, post);
  });

}