const mongoose = require("mongoose");

const QuizQuestion = new mongoose.Schema(
  { 
    question: {type: String , required: true},
    answers: {type: mongoose.Schema.Types.Mixed, required: true},
    correct_answers: {type: mongoose.Schema.Types.Mixed},
  },
  { collection: "quiz-questions" }
);

const model = mongoose.model("QuizQuestion", QuizQuestion);

module.exports = model;
