const mongoose = require("mongoose");

const Quiz = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   
    date: { type: Date, default: Date.now },
    score: { type: Number }
  },
  { collection: "quiz-data" }
);

const model = mongoose.model("QuizData", Quiz);

module.exports = model;
