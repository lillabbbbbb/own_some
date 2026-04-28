import { Server, Socket } from "socket.io";
import { createMessage } from "../../services/message/message.service";
import { getSocketId } from "../../services/user/user.service";
import { Events } from "../../shared/events";

export function registerMessageGateway(io: Server, socket: Socket) {

  socket.on(Events.MESSAGE_SEND, ({ from, to, text }) => {
    const message = createMessage({ from, to, text });

    const targetSocket = getSocketId(to);

    if (targetSocket) {
      io.to(targetSocket).emit(Events.MESSAGE_NEW, message);
    }

    socket.emit(Events.MESSAGE_NEW, message);
  });

}