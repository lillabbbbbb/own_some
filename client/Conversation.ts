import { ChatMessage } from "../shared/types";

export default class Conversation {
  private userA: string;
  private userB: string;
  private messages: ChatMessage[] = [];

  constructor(userA: string, userB: string) {
    this.userA = userA;
    this.userB = userB;
  }

  // check if this conversation matches two users
  public involves(user1: string, user2: string): boolean {
    return (
      (this.userA === user1 && this.userB === user2) ||
      (this.userA === user2 && this.userB === user1)
    );
  }

  // add message
  public addMessage(from: string, to: string, text: string): ChatMessage {
    const msg: ChatMessage = {
      from,
      to,
      text,
      timestamp: Date.now()
    };

    this.messages.push(msg);
    return msg;
  }

  // get full chat history
  public getMessages(): ChatMessage[] {
    return [...this.messages]; // prevent external mutation
  }

  // get last N messages (useful for CLI rendering)
  public getRecent(limit: number): ChatMessage[] {
    return this.messages.slice(-limit);
  }
}