import crypto from "crypto";
import { Message } from "../../shared/types";

const messages: Message[] = [];

export function createMessage(data: Omit<Message, "id" | "timestamp">) {
  const message: Message = {
    id: crypto.randomUUID(),
    ...data,
    timestamp: Date.now()
  };

  messages.push(message);
  return message;
}