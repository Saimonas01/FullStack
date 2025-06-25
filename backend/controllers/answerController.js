import Answer from '../models/Answer.js';
import Question from '../models/Question.js';

export const getAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10, sort = 'score' } = req.query;

    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    let sortObj = {};
    switch (sort) {
      case 'date':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default:
        sortObj = { score: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: { question: question._id, isActive: true } },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          dislikeCount: { $size: '$dislikes' },
          score: { $subtract: [{ $size: '$likes' }, { $size: '$dislikes' }] },
        },
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                username: 1,
                reputation: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$author' },
    ];

    const answers = await Answer.aggregate(pipeline);

    if (req.user) {
      answers.forEach(answer => {
        const userLike = answer.likes.find(like => like.user.toString() === req.user.id);
        const userDislike = answer.dislikes.find(dislike => dislike.user.toString() === req.user.id);
        answer.userVote = userLike ? 'like' : userDislike ? 'dislike' : null;
      });
    }

    const total = await Answer.countDocuments({
      question: questionId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: answers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      answers,
    });
  } catch (error) {
    next(error);
  }
};

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