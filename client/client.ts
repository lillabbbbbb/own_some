import fetch from "node-fetch";

const API = "http://localhost:3000";

function arg(i: number) {
  return process.argv[i];
}

async function req(path: string, options?: any) {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" }
    });

    return await res.json();
  } catch {
    return { success: false, error: "Gateway offline" };
  }
}

async function main() {
  const cmd = arg(2);

  if (!cmd) return console.log("No command");

  // LOGIN
  if (cmd === "/log-in") {
    const name = arg(3);
    if (!name) return console.log("Missing name");

    console.log(await req("/login", {
      method: "POST",
      body: JSON.stringify({ name })
    }));
  }

  // CHAT HISTORY
  if (cmd === "/message") {
    const name = arg(3);
    if (!name) return console.log("Missing name");

    console.log(await req(`/message/${name}`));
  }

  // FEED
  if (cmd === "/feed") {
    console.log(await req("/feed"));
  }

  // SEARCH
  if (cmd === "/search") {
    const q = arg(3);
    console.log(await req(`/search?q=${q}`));
  }
}

main();