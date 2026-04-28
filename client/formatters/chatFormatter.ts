import { BubbleOptions, type Message, type Align, Post, FrameOptions } from "../../shared/types"
import chalk from "chalk";

const termWidth = process.stdout.columns || 80;


function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + word).length > maxWidth) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }

  if (current) lines.push(current.trim());
  return lines;
}

function createBubble(text: string, options: BubbleOptions = {}): string[] {
  const {
    align = "left",
    maxWidth = 40,
    padding = 1
  } = options;

  const termWidth: number = process.stdout.columns || 80;

  const lines = wrapText(text, maxWidth);
  const contentWidth = Math.max(...lines.map(l => l.length));

  const horizontal = "─".repeat(contentWidth + padding * 2);

  const top = `┌${horizontal}┐`;
  const bottom = `└${horizontal}┘`;

  const middle = lines.map(line => {
    const space = " ".repeat(contentWidth - line.length);
    return `│${" ".repeat(padding)}${line}${space}${" ".repeat(padding)}│`;
  });

  const bubble = [top, ...middle, bottom];

  if (align === "right") {
    return bubble.map(line => {
      const space = termWidth - line.length;
      return " ".repeat(Math.max(space, 0)) + line;
    });
  }

  return bubble;
}

function printBubble(text: string, isOwnMessage: boolean) {
  const bubble = createBubble(text, {
    align: isOwnMessage ? "right" : "left",
    maxWidth: 50
  });

  bubble.forEach(line => console.log(line));
}

export function printChat(messages: Message[]) {
  let lastSender: string | null = null;

  for (const msg of messages) {
    const isNewGroup = msg.sender !== lastSender;

    // 1. print sender name only if new group
    if (isNewGroup) {
      console.log("");
      const label = msg.isOwn ? "You" : msg.sender

      if (msg.isOwn) {
        // RIGHT aligned name
        const padded = label.padStart(termWidth);
        console.log(chalk.blue(padded));
      } else {
        // LEFT aligned name
        console.log(chalk.magenta(label));
      }
    }

    // 2. print bubble
    const bubble = createBubble(msg.text, {
      align: msg.isOwn ? "right" : "left",
      showTail: true,
      maxWidth: 50
    });

    bubble.forEach(line => console.log(line));

    lastSender = msg.sender;
  }
}