import chalk from "chalk";
import { Comment } from "../../shared/types";

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

export function printComments(comments: Comment[], depth = 0) {
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