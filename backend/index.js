import express from "express";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model("User", {
  telegramId: String,
  balance: Number
});

const app = express();
app.use(express.json());

app.post("/auth", async (req, res) => {
  const { telegramId } = req.body;

  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({ telegramId, balance: 0 });
  }

  res.json(user);
});

app.listen(3000, () => console.log("Backend running"));
