import { Server, Socket } from "socket.io";
import { getFeed } from "../../services/post/post.service";
import { Events } from "../../shared/events";

export function registerFeedGateway(io: Server, socket: Socket) {

  socket.on(Events.FEED_SUBSCRIBE, () => {
    const feed = getFeed();

    socket.emit(Events.FEED_INIT, feed);
  });

}