import Conversation from "./Conversation"
import { ChatMessage } from "../shared/types";

export class ConversationManager {
  private conversations: Conversation[] = [];

  private find(user1: string, user2: string): Conversation | undefined {
    return this.conversations.find(c => c.involves(user1, user2));
  }

  public getOrCreate(user1: string, user2: string): Conversation {
    let conv = this.find(user1, user2);

    if (!conv) {
      conv = new Conversation(user1, user2);
      this.conversations.push(conv);
    }

    return conv;
  }

  public sendMessage(from: string, to: string, text: string): ChatMessage {
    const conv = this.getOrCreate(from, to);
    return conv.addMessage(from, to, text);
  }

  public getConversation(user1: string, user2: string): ChatMessage[] {
    return this.getOrCreate(user1, user2).getMessages();
  }
}