import { Server, Socket } from "socket.io";
import { getFeed } from "../../services/post/post.service";
import { Events } from "../../shared/events";
import { searchUsers } from "../../services/search/search.service";

export function registerSearchGateway(io: Server, socket: Socket) {
  socket.on(Events.SEARCH, (rawQuery: unknown) => {
    try {
      //Input validation
      if (typeof rawQuery !== "string") {
        return socket.emit(Events.SEARCH_RESULTS, {
          query: "",
          results: [],
          error: "Invalid search query"
        });
      }

      const query = rawQuery.trim().toLowerCase();

      // Handling empty query
      if (!query) {
        return socket.emit(Events.SEARCH_RESULTS, {
          query,
          results: []
        });
      }

      // ✅ Send structured response
      socket.emit(Events.SEARCH_RESULTS, {
        query,
        searchUsers
      });

    } catch (err) {
      console.error("Search error:", err);

      socket.emit(Events.SEARCH_RESULTS, {
        query: typeof rawQuery === "string" ? rawQuery : "",
        results: [],
        error: "Server error"
      });
    }
  });
}