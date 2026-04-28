export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Align = "left" | "right";

export type ChatMessage = {
  from: string;
  to: string;
  text: string;
  timestamp: number;
};

export type Message = {
  sender: string;
  text: string;
  isOwn: boolean;
};



export interface BubbleOptions {
  align?: Align;
  maxWidth?: number;
  padding?: number;
  showTail?: boolean;
}

export type Post = {
  id: string | number;
  user: string;
  text: string;
  timestamp?: number;
  comments: Comment[];
};

export type Comment = {
  id?: string | number;
  user: string;
  text: string;
  timestamp: number;
  replies: Comment[];
};

export type FrameOptions = {
  width?: number;
  align?: "left" | "right";
};