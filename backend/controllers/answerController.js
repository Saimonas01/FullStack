import Answer from "../models/Answer.js";
import { getDB } from "../config/database.js";
import Question from "../models/Question.js";
import { ObjectId } from "mongodb";

export const createAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const answer = await Answer.create({
      content,
      question: questionId,
      author: req.user._id,
    });

    const db = getDB();
    const author = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user._id) },
        { projection: { username: 1, reputation: 1, avatar: 1 } }
      );

    res.status(201).json({
      success: true,
      answer: {
        ...answer,
        likeCount: 0,
        dislikeCount: 0,
        userVote: null,
        author,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnswer = async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.id);

    if (!answer || !answer.isActive) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this answer",
      });
    }

    const { content } = req.body;

    answer = await Answer.findByIdAndUpdate(
      req.params.id,
      { content },
      {
        new: true,
        runValidators: true,
      }
    );

    const db = getDB();
    const author = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user._id) },
        { projection: { username: 1, reputation: 1, avatar: 1 } }
      );

    res.status(200).json({
      success: true,
      answer:{
        ...answer,
        author
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer || !answer.isActive) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this answer",
      });
    }

    await Answer.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const voteAnswer = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const answerId = req.params.id;
    const userId = req.user._id.toString();

    if (!["like", "dislike"].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be either "like" or "dislike"',
      });
    }

    const answer = await Answer.findById(answerId);

    if (!answer || !answer.isActive) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const existingLike = answer.likes.find((like) => like.user === userId);
    const existingDislike = answer.dislikes.find(
      (dislike) => dislike.user === userId
    );

    if (existingLike) {
      answer.likes = answer.likes.filter((like) => like.user !== userId);
    }
    if (existingDislike) {
      answer.dislikes = answer.dislikes.filter(
        (dislike) => dislike.user !== userId
      );
    }

    if (vote === "like" && !existingLike) {
      answer.likes.push({ user: userId });
    } else if (vote === "dislike" && !existingDislike) {
      answer.dislikes.push({ user: userId });
    }

    await answer.save();

    const updatedAnswer = await Answer.findById(answerId);

    const userLike = updatedAnswer.likes.find((like) => like.user === userId);
    const userDislike = updatedAnswer.dislikes.find(
      (dislike) => dislike.user === userId
    );

    const db = getDB();
    const author = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user._id) },
        { projection: { username: 1, reputation: 1, avatar: 1 } }
      );

    res.status(200).json({
      success: true,
      answer: {
        ...updatedAnswer,
        userVote: userLike ? "like" : userDislike ? "dislike" : null,
        likeCount: updatedAnswer.likes.length,
        dislikeCount: updatedAnswer.dislikes.length,
        author,
      },
    });
  } catch (error) {
    next(error);
  }
};
