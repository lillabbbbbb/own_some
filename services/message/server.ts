import express from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../../shared/types";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/social");

type Message = {
  from: string;
  to: string;
  text: string;
  timestamp: Date;
};

const MessageSchema = new mongoose.Schema({
  from: String,
  to: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model("Message", MessageSchema);

// SEND MESSAGE
app.post("/message", async (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.json({ success: false, error: "Missing fields" });
  }

  const msg = await MessageModel.create({ from, to, text });

  res.json({ success: true, data: msg });
});

// CHAT HISTORY (/message name)
app.get("/chat/:name", async (req, res) => {
  const name = req.params.name;

  const chat = await MessageModel.find({
    $or: [{ from: name }, { to: name }]
  });

  res.json({ success: true, data: chat });
});

app.listen(4002, () => console.log("Message service running"));