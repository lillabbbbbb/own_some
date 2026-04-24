import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/social");

type Comment = {
  _id?: string;
  text: string;
  replies: Comment[];
};

type Post = {
  user: string;
  text: string;
  comments: Comment[];
};

const PostSchema = new mongoose.Schema({
  user: String,
  text: String,
  comments: Array
});

const PostModel = mongoose.model("Post", PostSchema);

// POST
app.post("/post", async (req, res) => {
  const post = await PostModel.create({
    user: req.body.user,
    text: req.body.text,
    comments: []
  });

  res.json({ success: true, data: post });
});

// COMMENT
app.post("/comment", async (req, res) => {
  const post = await PostModel.findById(req.body.postId);
  if (!post) return res.json({ success: false });

  post.comments.push({ text: req.body.text, replies: [] });
  await post.save();

  res.json({ success: true, data: post });
});

// REPLY (recursive traversal)
function addReply(comments: any[], id: string, text: string): boolean {
  for (const c of comments) {
    if (c._id == id) {
      c.replies.push({ text, replies: [] });
      return true;
    }
    if (addReply(c.replies, id, text)) return true;
  }
  return false;
}

app.post("/reply", async (req, res) => {
  const post = await PostModel.findById(req.body.postId);
  if (!post) return res.json({ success: false });

  addReply(post.comments, req.body.commentId, req.body.text);

  await post.save();

  res.json({ success: true, data: post });
});

// FEED
app.get("/feed", async (req, res) => {
  const posts = await PostModel.find();
  res.json({ success: true, data: posts });
});

app.listen(4003, () => console.log("Feed service running"));