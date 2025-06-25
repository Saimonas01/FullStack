import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const questionCount = await Question.countDocuments({
      author: user._id,
      isActive: true,
    });

    const answerCount = await Answer.countDocuments({
      author: user._id,
      isActive: true,
    });

    const recentQuestions = await Question.find({
      author: user._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt views')
      .populate({
        path: 'answers',
        match: { isActive: true },
        select: '_id',
      });

    const userProfile = {
      ...user.toObject(),
      stats: {
        questions: questionCount,
        answers: answerCount,
      },
      recentQuestions: recentQuestions.map(q => ({
        ...q.toObject(),
        answerCount: q.answers.length,
      })),
    };

    res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'reputation',
      order = 'desc',
      search,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = {};
    switch (sort) {
      case 'username':
        sortObj = { username: order === 'desc' ? -1 : 1 };
        break;
      case 'date':
        sortObj = { createdAt: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortObj = { reputation: order === 'desc' ? -1 : 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    next(error);
  }
};