import Answer from '../models/Answer.js';
import Question from '../models/Question.js';


export const createAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const answer = await Answer.create({
      content,
      question: questionId,
      author: req.user.id,
    });

    await answer.populate('author', 'username reputation avatar');

    res.status(201).json({
      success: true,
      answer,
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
        message: 'Answer not found',
      });
    }

    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this answer',
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
    ).populate('author', 'username reputation avatar');

    res.status(200).json({
      success: true,
      answer,
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
        message: 'Answer not found',
      });
    }

    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer',
      });
    }

    await Answer.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const voteAnswer = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const answerId = req.params.id;
    const userId = req.user.id;

    if (!['like', 'dislike'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be either "like" or "dislike"',
      });
    }

    const answer = await Answer.findById(answerId);

    if (!answer || !answer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
      });
    }

    const existingLike = answer.likes.find(like => like.user.toString() === userId);
    const existingDislike = answer.dislikes.find(dislike => dislike.user.toString() === userId);

    if (existingLike) {
      answer.likes = answer.likes.filter(like => like.user.toString() !== userId);
    }
    if (existingDislike) {
      answer.dislikes = answer.dislikes.filter(dislike => dislike.user.toString() !== userId);
    }

    if (vote === 'like' && !existingLike) {
      answer.likes.push({ user: userId });
    } else if (vote === 'dislike' && !existingDislike) {
      answer.dislikes.push({ user: userId });
    }

    await answer.save();

    const updatedAnswer = await Answer.findById(answerId)
      .populate('author', 'username reputation avatar');

    const userLike = updatedAnswer.likes.find(like => like.user.toString() === userId);
    const userDislike = updatedAnswer.dislikes.find(dislike => dislike.user.toString() === userId);
    const answerObj = updatedAnswer.toObject();
    answerObj.userVote = userLike ? 'like' : userDislike ? 'dislike' : null;

    res.status(200).json({
      success: true,
      answer: answerObj,
    });
  } catch (error) {
    next(error);
  }
};