import { Server, Socket } from "socket.io";
import crypto from "crypto";
import { Events } from "../../shared/events";
import { EventMap } from "../../shared/eventMap";

export function registerCommentGateway(io: Server, socket: Socket) {

  // ➕ ADD COMMENT
  socket.on(
    Events.COMMENT_ADD,
    (data: EventMap[Events.COMMENT_ADD]) => {
      console.log("COMMENT_ADD");

      const { postId, user, text } = data;

      const comment = {
        id: crypto.randomUUID(),
        user,
        text,
        timestamp: Date.now(),
        replies: []
      };

      // ✅ correct outgoing event
      io.emit(Events.COMMENT_ADDED, {
        postId,
        comment
      });
    }
  );

  // ↩️ REPLY TO COMMENT
  socket.on(
    Events.COMMENT_REPLY,
    (data: EventMap[Events.COMMENT_REPLY]) => {
      console.log("COMMENT_REPLY");

      const { postId, parentCommentId, user, text } = data;

      const reply = {
        id: crypto.randomUUID(),
        user,
        text,
        timestamp: Date.now(),
        replies: []
      };

      io.emit(Events.COMMENT_REPLIED, {
        postId,
        parentCommentId,
        reply
      });
    }
  );
}