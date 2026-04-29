import { userSocketMap } from "./server";

export const users = new Map<string, { socketId: string }>();

export function loginUser(name: string, socketId: string) {
  users.set(name, { socketId });
  userSocketMap.set(name, socketId);
}

export function getSocketId(name: string) {
  return users.get(name)?.socketId;
}

export function disconnectUser(socketId: string) {
  for (const [user, sockId] of userSocketMap.entries()) {
    if (sockId === socketId) {
      userSocketMap.delete(user);
      break;
    }
  }
}