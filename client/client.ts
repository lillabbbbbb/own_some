import readline from "readline";
import crypto from "crypto";
import process from "process";
import { BubbleOptions, type Message, type Align, Post, Comment, FrameOptions } from "../shared/types"
import chalk from "chalk"
import FeedViewer from "./FeedViewer"
import { sockets } from "./gateway";
import { printChat } from "./formatters/chatFormatter";

let stdinAttached = false;

type State = {
  currentUser: string | null;
  posts: Post[];
  feedOpen: boolean;
  feedIndex: number;
};

export const state: State = {
  currentUser: null,
  posts: [],
  feedOpen: false,
  feedIndex: 0
};
const comments1: Comment[] = [
  {
    id: crypto.randomUUID(),
    user: "Bob",
    text: "Nice start!",
    timestamp: Date.now(),
    replies: [
      {
        id: crypto.randomUUID(),
        user: "Alice",
        text: "Thanks Bob!",
        timestamp: Date.now(),
        replies: []
      },
      {
        id: crypto.randomUUID(),
        user: "Charlie",
        text: "Agreed 🔥",
        timestamp: Date.now(),
        replies: [
          {
            id: crypto.randomUUID(),
            user: "Bob",
            text: "This platform is promising",
            timestamp: Date.now(),
            replies: []
          }
        ]
      }
    ]
  }
];

const comments2: Comment[] = [
  {
    id: crypto.randomUUID(),
    user: "Alice",
    text: "But less addictive 😄",
    timestamp: Date.now(),
    replies: [
      {
        id: crypto.randomUUID(),
        user: "Bob",
        text: "That's the goal",
        timestamp: Date.now(),
        replies: []
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    user: "Charlie",
    text: "Needs hashtags!",
    timestamp: Date.now(),
    replies: []
  }
];

const comments3: Comment[] = [
  {
    id: crypto.randomUUID(),
    user: "Alice",
    text: "Feels like a terminal app from the future",
    timestamp: Date.now(),
    replies: [
      {
        id: crypto.randomUUID(),
        user: "Charlie",
        text: "Exactly what I was going for",
        timestamp: Date.now(),
        replies: [
          {
            id: crypto.randomUUID(),
            user: "Bob",
            text: "You guys nailed it",
            timestamp: Date.now(),
            replies: []
          }
        ]
      }
    ]
  }
];


const testPosts = [
  { id: crypto.randomUUID(), user: "Alice", text: "Welcome to my feed", timestamp: Date.now(), comments: comments1 },
  { id: crypto.randomUUID(), user: "Bob", text: "This feels like Twitter CLI", timestamp: Date.now(), comments: comments2 },
  { id: crypto.randomUUID(), user: "Charlie", text: "Arrow keys navigation is awesome", timestamp: Date.now(), comments: comments3 }
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

const testMessages = [
  { sender: "Alice", text: "Hey!", isOwn: false },
  { sender: "Alice", text: "How are you?", isOwn: false },
  { sender: "Alice", text: "You there?", isOwn: false },
  { sender: "You", text: "Yeah I'm here", isOwn: true },
  { sender: "You", text: "What's up?", isOwn: true },
  { sender: "Bob", text: "Join the group", isOwn: false }
];

function getCurrentPost(): Post | null {
  return state.posts[state.feedIndex] ?? null;
}

function parseInput(input: string): { cmd: string; args: string[] } {
  const regex = /"([^"]*)"|(\S+)/g;

  const tokens: string[] = [];
  let match;


  while ((match = regex.exec(input)) !== null) {
    const value = match[1] ?? match[2];

    if (value !== undefined) {
      tokens.push(value);
    }
  }

  const [cmd, ...args] = tokens;

  return {
    cmd: cmd || "",
    args: args || []
  };
}


export async function handleCommand(input: string) {
  const { cmd, args } = parseInput(input.trim());

  switch (cmd) {
    case "/login": {
      const name = args[0];
      if (!name) return console.log("Missing name");

      state.currentUser = name
      console.log(`Welcome ${state.currentUser}`);

      sockets.users.emit("user:login", { name: state.currentUser });

      break;
    }

    case "/messages": {

    }

    case "/send": {
      if (!state.currentUser) return console.log("Login first");

      const [to, ...msgParts] = args;
      const text = msgParts.join(" ");

      sockets.messages.emit("message:send", {
        from: state.currentUser,
        to,
        text
      });

      break;
    }

    case "/post": {
      if (!state.currentUser) return console.log("Login first");

      const text = args.join(" ");

      sockets.posts.emit("post:create", {
        user: state.currentUser,
        text
      });

      FIX THIS PART
      state.posts.push()

      console.log("New post added")
      break;
    }

    case "/comment": {
      if (!state.currentUser) return console.log("Login first");

      const [parentCommentId, ...textParts] = args;
      const text = textParts.join(" ");

      const post = getCurrentPost()
      if (!post) return console.log("No active post");


      if (!parentCommentId) {
        sockets.comments.emit("comment:add", {
          postId: Number(post.id),
          user: state.currentUser,
          text
        });
      } else {
        sockets.posts.emit("comment:reply", {
          postId : Number(post.id),
          parentCommentId,
          user: state.currentUser,
          text,
        });
      }

      break;
    }

    case "/search": {
      const q = args.join(" ");
      sockets.search.emit("search", q);
      break;
    }

    case "/feed": {
      if (!state.currentUser) {
        console.log("Login first");
        break;
      }

      state.feedOpen = true;
      state.feedIndex = 0;

      console.clear();
      console.log("📡 Live feed started...");

      sockets.posts.emit("feed:subscribe", {
        user: state.currentUser
      });

      attachInputHandler();
      draw();

      break;
    }

    case "/guide":
      console.log(`
/login <name>
/send <user> <message>
/post <text>
/feed
/search <query>
/exit
      `);
      break;

    case "/exit": {
      process.exit(0)
    }

    default:
      console.log("Unknown command");
  }
}

const colors = [
  chalk.cyan,
  chalk.yellow,
  chalk.magenta,
  chalk.green,
  chalk.blue,
  chalk.red,
  chalk.hex("#FFA500"), // orange
  chalk.hex("#00CED1")  // teal
];

const userColorMap = new Map<string, any>();

function getUserColor(user: string) {
  if (!userColorMap.has(user)) {
    const colorFn = colors[userColorMap.size % colors.length];
    userColorMap.set(user, colorFn);
  }
  return userColorMap.get(user);
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function printComments(comments: Comment[], depth = 0) {
  const indent = "   ".repeat(depth);

  comments.forEach((c, i) => {
    const isLast = i === comments.length - 1;

    const branch =
      depth === 0
        ? "💬 "
        : isLast
          ? "└─ "
          : "├─ ";

    const userColor = getUserColor(c.user);
    const username = userColor.bold.italic(c.user);
    const text = chalk.white(c.text);
    const time = chalk.gray(`(${formatTime(c.timestamp)})`);

    console.log(
      indent +
      branch +
      username +
      chalk.white(": ") +
      text +
      " " +
      time
    );

    if (c.replies?.length) {
      printComments(c.replies, depth + 1);
    }
  });
}

// Start main program
async function main() {
  console.log("CLI started. Type /guide");
  rl.prompt();

  rl.on("line", async (input) => {
    await handleCommand(input);
    rl.prompt();
  });
}

main();


function wrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if ((line + word).length > width) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

function draw() {
    console.clear();

    const post = getCurrentPost();
    if (!post) {
      console.log("No posts yet...");
      return;
    }

    const frame = renderPost(post, state.feedIndex, state.posts.length);
    frame.forEach(l => console.log(l));

    printComments(post.comments);

    console.log("\n⬅️ prev  ➡️ next  | q quit");
  }

  draw();

function renderPost(post: Post, index: number, total: number) {
  const width = 55;

  const header = `${post.user} • ${post.timestamp ?? ""}  (${index + 1}/${total})`;

  const lines = wrap(post.text, width);

  const top = "┌" + "─".repeat(width + 2) + "┐";
  const divider = "├" + "─".repeat(width + 2) + "┤";
  const bottom = "└" + "─".repeat(width + 2) + "┘";

  const headerLine = "│ " + header.padEnd(width, " ") + " │";

  const body = lines.map(l =>
    "│ " + l.padEnd(width, " ") + " │"
  );

  return [top, headerLine, divider, ...body, bottom];
}

let feedListenerAttached = false;

export function startFeedViewer(posts: Post[]) {
  const feed = new FeedViewer(posts);

  if (!feedListenerAttached) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      if (key === "q" || key === "\u0003") state.feedOpen = false;

      if (key === "\u001b[D") feed.prev(); draw();
      if (key === "\u001b[C") feed.next(); draw();

      draw();
    });

    feedListenerAttached = true;
  }
}

function attachInputHandler() {
  if (stdinAttached) return;

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {
    if (!state.feedOpen) return;

    if (key === "q" || key === "\u0003") {
      state.feedOpen = false;
      process.exit(0);
    }

    if (key === "\u001b[D") {
      state.feedIndex = Math.max(0, state.feedIndex - 1);
      draw();
    }

    if (key === "\u001b[C") {
      state.feedIndex = Math.min(state.posts.length - 1, state.feedIndex + 1);
      draw();
    }
  });

  stdinAttached = true;
}