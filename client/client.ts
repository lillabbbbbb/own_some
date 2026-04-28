import readline from "readline";
import crypto from "crypto";
import process from "process";
import chalk from "chalk";
import { type Post, type Comment } from "../shared/types";
import { io } from "socket.io-client";
import { renderPost } from "./formatters/postFormatter";
import { State } from "../shared/types"
import { Events } from "../shared/events";
import { printComments } from "../client/formatters/commentFormatter"

const socket = io("http://localhost:4000");

let isRendering = false;
let renderQueued = false;

export const state: State = {
  currentUser: null,
  posts: [],
  feedOpen: false,
  feedIndex: 0
};

socket.onAny((event, data) => {
  console.log("📡 EVENT:", event, data);
});


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

let stdinAttached = false;

function scheduleRender() {
  if (renderQueued) return;

  renderQueued = true;

  setImmediate(() => {
    renderQueued = false;
    draw();
  });
}

function renderCommentLine() {
  process.stdout.write("\x1b[2K\r");
  process.stdout.write(`💬 ${uiState.commentBuffer}`);
}


function parseInput(input: string): { cmd: string; args: string[] } {
  const regex = /"([^"]*)"|(\S+)/g;
  const tokens: string[] = [];

  let match;
  while ((match = regex.exec(input)) !== null) {
    const value = match[1] ?? match[2];
    if (value) tokens.push(value);
  }

  const [cmd, ...args] = tokens;

  return {
    cmd: cmd || "",
    args
  };
}


export async function handleCommand(input: string) {
  const { cmd, args } = parseInput(input.trim());

  switch (cmd) {

    /* ---------------- LOGIN ---------------- */
    case "/login": {
      const name = args[0];
      if (!name) return console.log("Missing name");

      if (state.currentUser) return console.log(`Already logged in as ${state.currentUser}`)

      state.currentUser = name;

      socket.emit(Events.USER_LOGIN, { name });

      console.log(`Welcome ${name}`);
      break;
    }

    case "/logout": {
      state.currentUser = null
      main()
    }

    /* ---------------- MESSAGE ---------------- */
    case "/send": {
      if (!state.currentUser) return console.log("Login first");

      const [to, ...msgParts] = args;
      if (!args) return console.log(chalk.red("Incomplete command"))

      // ✅ CHANGED: gateway-only emit
      socket.emit(Events.MESSAGE_SEND, {
        from: state.currentUser,
        to,
        text: msgParts.join(" ")
      });

      break;
    }

    /* ---------------- POST ---------------- */
    case "/post": {
      if (!state.currentUser) return console.log("Login first");

      const newPost: Post = {
        id: crypto.randomUUID(),
        user: state.currentUser,
        text: args.join(" "),
        timestamp: Date.now(),
        comments: []
      };

      // ✅ CHANGED: send to gateway instead of posts service
      socket.emit(Events.POST_CREATE, newPost);

      // optimistic UI update
      state.posts.push(newPost);

      console.log("New post added");
      break;
    }

    /* ---------------- COMMENT ---------------- */
    case "/comment": {
      if (!state.currentUser) return console.log("Login first");

      const [parentCommentId, ...textParts] = args;

      const post = getCurrentPost();
      if (!post) return console.log("No active post");

      socket.emit(
        parentCommentId ? Events.COMMENT_REPLY : Events.COMMENT_ADD,
        {
          postId: post.id,
          parentCommentId,
          user: state.currentUser,
          text: textParts.join(" ")
        }
      );

      break;
    }

    /* ---------------- FEED ---------------- */
    case "/feed": {
      if (!state.currentUser) return console.log("Login first");

      state.feedOpen = true;
      state.feedIndex = 0;

      console.clear();
      console.log("📡 Live feed started...");

      // ✅ CHANGED: gateway subscription
      socket.emit(Events.FEED_SUBSCRIBE, {
        user: state.currentUser
      });

      rl.pause();
      attachInputHandler();
      draw();

      break;
    }

    /* ---------------- SEARCH ---------------- */
    case "/search": {
      // ✅ CHANGED: gateway-only search
      socket.emit(Events.SEARCH, args.join(" "));
      break;
    }

    case "/exit":
      process.exit(0);

    case "/guide":
      console.log(`
/login <name>
/send <user> <message>
/post <text>
/comment <text>
/feed
/search <query>
/exit
      `);
      break;

    default:
      console.log(chalk.red("Unknown command"));
  }
}


function attachSocketListeners() {

  socket.on(Events.MESSAGE_NEW, (msg) => {
    console.log(`💬 ${msg.from}: ${msg.text}`);
  });

  socket.on(Events.SEARCH_RESULTS, () => {
    
  })

  // ✅ feed initialization
  socket.on(Events.FEED_INIT, (posts: Post[]) => {
    state.posts = posts;
    scheduleRender()
  });

  // ✅ new post broadcast
  socket.on(Events.POST_CREATED, (post: Post) => {
    state.posts.unshift(post);
    scheduleRender()
  });

  // ✅ comment added
  socket.on(Events.COMMENT_ADDED, ({ postId, comment }) => {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    post.comments.push(comment);
    scheduleRender()
  });

  // ✅ nested comment reply
  socket.on(Events.COMMENT_REPLIED, ({ postId, parentCommentId, reply }) => {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const find = (comments: Comment[]): Comment | null => {
      for (const c of comments) {
        if (c.id === parentCommentId) return c;
        const found = find(c.replies);
        if (found) return found;
      }
      return null;
    };

    const parent = find(post.comments);
    if (parent) parent.replies.push(reply);

    scheduleRender()
  });
}


function getCurrentPost(): Post | null {
  return state.posts[state.feedIndex] ?? null;
}


function draw() {
  if (!state.feedOpen) return;
  if (isRendering) return;

  isRendering = true;

  try {
    console.clear();

    const post = getCurrentPost();

    if (!post) {
      console.log("No posts yet...");
      return;
    }

    renderPost(post).forEach(line => console.log(line));

    console.log("\n💬 Comments:\n");
    printComments(post.comments);


    console.log("\n⬅️ prev  ➡️ next  |  c comment  |  q quit");
  } finally {
    isRendering = false;
  }
}

type InputMode = "feed" | "comment" | "idle";

const uiState = {
  mode: "feed" as InputMode,
  commentBuffer: ""
};

function attachInputHandler() {
  if (stdinAttached) return;

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {

    // 🚪 EXIT FEED MODE
    if (key === "q") {
      state.feedOpen = false;
      uiState.mode = "idle";

      rl.resume();
      console.clear();
      return;
    }

    // 💬 ENTER COMMENT MODE (press "c")
    if (key === "c" && uiState.mode === "feed") {
      uiState.mode = "comment";
      uiState.commentBuffer = "";
      console.log("\n💬 Comment mode (type, Enter to send, Esc to cancel)");
      return;
    }

    // ❌ CANCEL COMMENT MODE (ESC)
    if (key === "\u001b" && uiState.mode === "comment") {
      uiState.mode = "feed";
      uiState.commentBuffer = "";
      scheduleRender()
      return;
    }

    // 🟨 COMMENT INPUT MODE
    if (uiState.mode === "comment") {

      // ENTER → send comment
      if (key === "\r") {
        const text = uiState.commentBuffer.trim();

        if (text.length > 0) {
          const post = getCurrentPost();

          if (post) {
            const optimisticComment = {
              id: crypto.randomUUID(),
              user: state.currentUser!,
              text,
              timestamp: Date.now(),
              replies: []
            };

            post.comments.push(optimisticComment);
            scheduleRender();
          }
        }

        uiState.commentBuffer = "";
        uiState.mode = "feed";
        scheduleRender()
        return;
      }

      // BACKSPACE
      if (key === "\u0008" || key === "\u007f") {
        uiState.commentBuffer = uiState.commentBuffer.slice(0, -1);
        process.stdout.write("\b \b");
        return;
      }

      // NORMAL CHARACTER INPUT
      uiState.commentBuffer += key;
      renderCommentLine();
      return;
    }

    // 📡 FEED NAVIGATION MODE
    if (uiState.mode === "feed") {

      if (key === "\u001b[D") {
        state.feedIndex = Math.max(0, state.feedIndex - 1);
        scheduleRender()
      }

      if (key === "\u001b[C") {
        state.feedIndex = Math.min(state.posts.length - 1, state.feedIndex + 1);
        scheduleRender()
      }
    }
  });

  stdinAttached = true;
}


async function main() {
  attachSocketListeners(); // IMPORTANT: register BEFORE usage

  console.log("CLI started. Type /guide for more options");
  rl.prompt();

  rl.on("line", async (input) => {
    await handleCommand(input);
    rl.prompt();
  });
}

main();