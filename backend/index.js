require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user");
const Quiz = require("./models/quiz");
const QuizQuestion = require("./models/quizQuestion");
// const quizAPI = require("./quiz");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const saltRounds = parseInt(process.env.SALT_ROUNDS);

app.use(cors());
app.use(express.json());

const dbUrl = "mongodb+srv://jain-mohit:quizapp@cluster0.y0dfaw8.mongodb.net/quizDatabase?retryWrites=true&w=majority"
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
mongoose.connect(dbUrl,connectionParams)
.then(()=>{
   console.info("Db connected");
})
.catch((e)=> console.log("Error :" , e));


app.post("/api/register", (req, res) => {
  try {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "error",
          message: "Error while Saving",
        });
      } else {
        User.create({
          name: req.body.username,
          email: req.body.email,
          password: hash,
        });
        console.log("hii");
        return res.json({ status: "ok" });
      }
    });
  } catch (err) {
    return res.json({ status: "error", error: "duplicate email" });
  }
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (user) {
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
          },
          "JWT_SECRET",
          { expiresIn: "5h" }
        );
        return res.json({
          status: "ok",
          token: token,
        });
      } else {
        return res.json({
          status: "error",
          message: "Invalid Password",
        });
      }
    });
  } else {
    return res.json({ status: "error", message: "Email-Id is not registerd " });
  }
});

app.post("/api/quiz", async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, "JWT_SECRET");
    if (decoded) {
      const email = decoded.email;
      const user = await User.findOne({
        email: email,
      });
      if (user) {
        const quizData = await QuizQuestion.find();
        
        const quiz = await Quiz.create({
          user: user._id,
        });
        return res.json({
          status: "ok",
          quizId: quiz._id,
          quizData: quizData,
        });
      } else {
        return res.json({
          status: "error",
          message: "User not found",
        });
      }
    } else {
      return res.json({ status: "error", message: "Invalid Token" });
    }
  } catch (err) {
    return res.json({ status: "error", message: "Invalid Token" });
  }
});

app.post("/api/result", async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, "JWT_SECRET");
    if (decoded) {
      const email = decoded.email;
      const user = await User.findOne({
        email: email,
      });
      if (user) {

        const quiz = await Quiz.updateOne(
          { _id: req.body.quizId },
          { score: req.body.score }
        );
        return res.json({
          status: "ok",
        });
      } else {
        return res.json({
          status: "error",
          message: "User not found",
        });
      }
    } else {
      return res.json({ status: "error", message: "Invalid Token" });
    }
  } catch (err) {
    return res.json({ status: "error", message: "Invalid Token" });
  }
});

app.get("/api/result/:quizId", async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, "JWT_SECRET");
    if (decoded) {
      const email = decoded.email;
      const user = await User.findOne({
        email: email,
      });
      if (user) {
        const totalQuestions = await QuizQuestion.count();

        const quiz = await Quiz.findOne({
          _id: req.params.quizId,
        });
        return res.json({
          status: "ok",
          score: quiz.score,
          totalQuestions
        });
      } else {
        return res.json({
          status: "error",
          message: "User not found",
        });
      }
    } else {
      return res.json({ status: "error", message: "Invalid Token" });
    }
  } catch (err) {
    return res.json({ status: "error", message: "Invalid Token" });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, "JWT_SECRET");
    if (decoded) {
      const email = decoded.email;
      const user = await User.findOne({
        email: email,
      });
      if (user) {
        const quiz = await Quiz.find({
          user: user._id,
        });
        return res.json({
          status: "ok",
          data: quiz,
        });
      } else {
        return res.json({
          status: "error",
          message: "User not found",
        });
      }
    } else {
      return res.json({ status: "error", message: "Invalid Token" });
    }
  } catch (err) {
    return res.json({ status: "error", message: "Invalid Token" });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
