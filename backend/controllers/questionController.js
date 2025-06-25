import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

export const getQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'date',
      order = 'desc',
      search,
      tags,
      status = 'all',
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.trim().toLowerCase()) };
    }

    let sortObj = {};
    switch (sort) {
      case 'answers':
        sortObj = { answerCount: order === 'desc' ? -1 : 1 };
        break;
      case 'views':
        sortObj = { views: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortObj = { createdAt: order === 'desc' ? -1 : 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'question',
          as: 'answers',
          pipeline: [{ $match: { isActive: true } }],
        },
      },
      {
        $addFields: {
          answerCount: { $size: '$answers' },
        },
      },
    ];

    if (status === 'answered') {
      pipeline.push({ $match: { answerCount: { $gt: 0 } } });
    } else if (status === 'unanswered') {
      pipeline.push({ $match: { answerCount: 0 } });
    }

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    pipeline.push({
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
    });

    pipeline.push({
      $unwind: '$author',
    });

    pipeline.push({
      $project: {
        answers: 0,
      },
    });

    const questions = await Question.aggregate(pipeline);

    const totalPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'question',
          as: 'answers',
          pipeline: [{ $match: { isActive: true } }],
        },
      },
      {
        $addFields: {
          answerCount: { $size: '$answers' },
        },
      },
    ];

    if (status === 'answered') {
      totalPipeline.push({ $match: { answerCount: { $gt: 0 } } });
    } else if (status === 'unanswered') {
      totalPipeline.push({ $match: { answerCount: 0 } });
    }

    totalPipeline.push({ $count: 'total' });

    const totalResult = await Question.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar')
      .populate({
        path: 'answers',
        match: { isActive: true },
        populate: {
          path: 'author',
          select: 'username reputation avatar',
        },
        options: { sort: { createdAt: -1 } },
      });

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await Question.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });

    if (req.user) {
      question.answers = question.answers.map(answer => {
        const answerObj = answer.toObject();
        const userLike = answer.likes.find(like => like.user.toString() === req.user.id);
        const userDislike = answer.dislikes.find(dislike => dislike.user.toString() === req.user.id);
        
        answerObj.userVote = userLike ? 'like' : userDislike ? 'dislike' : null;
        return answerObj;
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    const question = await Question.create({
      title,
      content,
      tags: tags.map(tag => tag.trim().toLowerCase()),
      author: req.user.id,
    });

    await question.populate('author', 'username reputation avatar');

    res.status(201).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question',
      });
    }

    const { title, content, tags } = req.body;

    question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags: tags.map(tag => tag.trim().toLowerCase()) }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('author', 'username reputation avatar');

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question',
      });
    }

    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    
    await Answer.updateMany(
      { question: req.params.id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};