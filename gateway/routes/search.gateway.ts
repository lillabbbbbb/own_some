import { Server, Socket } from "socket.io";
import { getFeed } from "../../services/post/post.service";
import { Events } from "../../shared/events";

export function registerSearchGateway(io: Server, socket: Socket) {

  socket.on(Events.SEARCH_RESULTS, (query: string) => {
    const feed = getFeed();

    socket.emit(Events.SEARCH_RESULTS, {query, results: ["result1", "result2"]});
  });

}