const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const user = require("./models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const Saltbcry = bcrypt.genSaltSync(11);
const jwtSecret = "dsgah545sadafgdsaddsad32";
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
mongoose.connect(process.env.MONGO_URL);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const User = await user.create({
      name,
      email,
      password: bcrypt.hashSync(password, Saltbcry),
    });
    res.json(User);
  } catch (e) {
    res.status(400).json(e);
  }
});
app.delete("/deleteAccount", async (req, res) => {
  const { email } = req.body;
  try {
    const deletedUser = await user.findOneAndDelete({ email });
    if (deletedUser) {
      res.json({ message: "Account deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const updatedUser = await user.findOneAndUpdate(
      { email },
      { name, password: bcrypt.hashSync(password, Saltbcry) },
      { new: true }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userInfo = await user.findOne({ email });
  if (userInfo) {
    const corrPass = bcrypt.compareSync(password, userInfo.password);
    if (corrPass) {
      jwt.sign(
        { email: userInfo.email, id: userInfo._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userInfo);
        }
      );
    } else {
      res.status(401).json("error password");
    }
  } else {
    res.status(401).json("Not Founded");
  }
});
app.get("/profile", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await user.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.listen(5000);
