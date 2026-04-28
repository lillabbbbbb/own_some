import { Post } from "../../shared/types";



export function renderPost(post: Post) {
  const width = 55;

  const header = `${post.user} • ${new Date(post.timestamp!).toLocaleTimeString()}`;

  const lines = wrap(post.text, width);

  return [
    "┌" + "─".repeat(width + 2) + "┐",
    "│ " + header.padEnd(width) + " │",
    "├" + "─".repeat(width + 2) + "┤",
    ...lines.map(l => "│ " + l.padEnd(width) + " │"),
    "└" + "─".repeat(width + 2) + "┘"
  ];
}

export function wrap(text: string, width: number): string[] {
  if (!text) return [];

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    // if adding this word exceeds width → push line
    if ((current + word).length > width) {
      if (current) lines.push(current.trim());

      // if single word is longer than width → split it
      if (word.length > width) {
        const chunks = word.match(new RegExp(`.{1,${width}}`, "g")) || [];
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] + " ";
      } else {
        current = word + " ";
      }
    } else {
      current += word + " ";
    }
  }

  if (current.trim()) {
    lines.push(current.trim());
  }

  return lines;
}