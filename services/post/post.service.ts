import crypto from "crypto";
import { Post } from "../../shared/types";

const posts: Post[] = [];

export function createPost(data: Omit<Post, "id" | "timestamp" | "comments">) {
  const post: Post = {
    id: crypto.randomUUID(),
    ...data,
    timestamp: Date.now(),
    comments: []
  };

  posts.unshift(post);
  return post;
}

export function getFeed() {
  return posts;
}