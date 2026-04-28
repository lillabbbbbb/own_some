import { io } from "socket.io-client";
import { TypedSocket } from "../shared/typedSocket";

export const socket = io("http://localhost:4000") as TypedSocket;