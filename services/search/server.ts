import express from "express";

const app = express();
app.use(express.json());

const data = ["hello", "feed post", "message system", "social app"];

app.get("/search", (req, res) => {
  const q = req.query.q as string;

  const results = data.filter(x =>
    x.toLowerCase().includes(q?.toLowerCase() || "")
  );

  res.json({ success: true, data: results });
});

app.listen(4004, () => console.log("Search service running"));