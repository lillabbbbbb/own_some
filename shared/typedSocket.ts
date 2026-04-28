import { Socket } from "socket.io-client";
import { EventMap } from "./eventMap";

export type TypedSocket = {
  emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K]
  ): void;

  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): void;
} & Socket;