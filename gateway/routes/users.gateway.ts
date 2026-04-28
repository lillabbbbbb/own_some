import { Server, Socket } from "socket.io";
import { loginUser } from "../../services/user/user.service";
import { Events } from "../../shared/events";

export function registerUserGateway(io: Server, socket: Socket) {

  socket.on(Events.USER_LOGIN, ({ name }) => {
    loginUser(name, socket.id);
  });

}