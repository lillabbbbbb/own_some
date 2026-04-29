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

export type Post = {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  comments: Comment[];
};

export type Comment = {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  replies: Comment[];
};

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
};



export interface BubbleOptions {
  align?: Align;
  maxWidth?: number;
  padding?: number;
  showTail?: boolean;
}

export type FrameOptions = {
  width?: number;
  align?: "left" | "right";
};


export type State = {
  currentUser: string | null;
  posts: Post[];
  feedOpen: boolean;
  feedIndex: number;
};

export type SearchResult = {
  username: string
}