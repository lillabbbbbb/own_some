import { BubbleOptions, type Message, type Align, Post, FrameOptions } from "../../shared/types"
import chalk from "chalk";

const getTermWidth = () => process.stdout.columns || 80;


function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + word).length > maxWidth) {
      if (current) lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }

  if (current) lines.push(current.trim());
  return lines;
}

function createBubble(text: string, options: BubbleOptions = {}): string[] {
  const termWidth = getTermWidth();

  const {
    align = "left",
    maxWidth = 40,
    padding = 1
  } = options;

  const lines = wrapText(text, maxWidth);
  const contentWidth = Math.max(...lines.map(l => l.length));

  const horizontal = "─".repeat(contentWidth + padding * 2);

  const top = `┌${horizontal}┐`;
  const bottom = `└${horizontal}┘`;

  const middle = lines.map(line => {
    const space = " ".repeat(contentWidth - line.length);
    return `│${" ".repeat(padding)}${line}${space}${" ".repeat(padding)}│`;
  });

  let bubble = [top, ...middle, bottom];

  if (align === "right") {
    bubble = bubble.map(line => {
      const space = Math.max(0, termWidth - line.length);
      return " ".repeat(space) + line;
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
  const termWidth = getTermWidth();
  let lastFrom: string | null = null;

  for (const msg of messages) {
    const isNewGroup = msg.from !== lastFrom;

    if (isNewGroup) {
      console.log("");

      const label = msg.from;

      if (msg.from === "You") {
        console.log(chalk.blue(label.padStart(termWidth)));
      } else {
        console.log(chalk.magenta(label));
      }
    }

    const bubble = createBubble(msg.text, {
      align: msg.from === "You" ? "right" : "left",
      maxWidth: 50
    });

    bubble.forEach(line => console.log(line));

    lastFrom = msg.from;
  }
}