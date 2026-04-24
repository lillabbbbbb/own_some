import express from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../../shared/types";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/social");

type User = {
  _id: mongoose.Types.ObjectId;
  name: string;
};

const UserSchema = new mongoose.Schema({
  name: String
});

const UserModel = mongoose.model("User", UserSchema);

// LOGIN (AUTO SIGN-UP)
app.post("/login", async (req, res) => {
  const name = req.body.name;

  if (!name) {
    return res.json({ success: false, error: "Missing name" } as ApiResponse<any>);
  }

  let user = await UserModel.findOne({ name });

  if (!user) {
    user = await UserModel.create({ name });
  }

  res.json({ success: true, data: user } as ApiResponse<User>);
});

// SETTINGS
app.put("/settings/:id", async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  res.json({ success: true, data: user } as ApiResponse<User>);
});

// RPC
app.get("/rpc/:id", async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  res.json({ success: true, data: user } as ApiResponse<User>);
});

app.listen(4001, () => console.log("User service running"));