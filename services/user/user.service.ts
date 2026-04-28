const users = new Map<string, { socketId: string }>();

export function loginUser(name: string, socketId: string) {
  users.set(name, { socketId });
}

export function getSocketId(name: string) {
  return users.get(name)?.socketId;
}