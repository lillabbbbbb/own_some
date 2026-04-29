import { Post, Message, Comment } from "./types";
import { Events } from "./events";

export interface EventMap {

  // 👤 USERS
  [Events.USER_LOGIN]: { name: string };

  // 📝 POSTS
  [Events.POST_CREATE]: { user: string; text: string };
  [Events.POST_CREATED]: Post;

  // 🔍 SEARCH
  [Events.SEARCH]: { query: string };
  [Events.SEARCH_RESULTS]: { query: string; user: string, posts: Post[], comments: Comment[] };

  // 📡 FEED
  [Events.FEED_SUBSCRIBE]: { user: string };
  [Events.FEED_INIT]: Post[];

  // 💬 MESSAGES
  [Events.MESSAGE_SEND]: { from: string; to: string; text: string };
  [Events.MESSAGE_NEW]: Message;

  // 💭 COMMENTS
  [Events.COMMENT_ADD]: { postId: string; user: string; text: string };
  [Events.COMMENT_ADDED]: { postId: string; comment: Comment };

  [Events.COMMENT_REPLY]: {
    postId: string;
    parentCommentId: string;
    user: string;
    text: string;
  };

  [Events.COMMENT_REPLIED]: {
    postId: string;
    parentCommentId: string;
    reply: Comment;
  };
}