import express from "express";

const app = express();
app.use(express.json());

const SERVICES = {
  user: "http://localhost:4001",
  message: "http://localhost:4002",
  feed: "http://localhost:4003",
  search: "http://localhost:4004"
};

async function safe(url: string, options?: any) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json" }
    });

    return await res.json();
  } catch {
    return { success: false, error: "Service down" };
  }
}

// LOGIN
app.post("/login", async (req, res) => {
  res.json(await safe(`${SERVICES.user}/login`, {
    method: "POST",
    body: JSON.stringify(req.body)
  }));
});

// CHAT HISTORY
app.get("/message/:name", async (req, res) => {
  res.json(await safe(`${SERVICES.message}/chat/${req.params.name}`));
});

// FEED
app.get("/feed", async (req, res) => {
  res.json(await safe(`${SERVICES.feed}/feed`));
});

// SEARCH
app.get("/search", async (req, res) => {
  res.json(await safe(`${SERVICES.search}/search?q=${req.query.q}`));
});

app.listen(3000, () => console.log("Gateway running"));