import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import { getDB } from "../config/database.js";
import { ObjectId } from "mongodb";

export const getQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "date",
      order = "desc",
      search,
      tags,
      status = "all",
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      query.tags = { $in: tagArray.map((tag) => tag.trim().toLowerCase()) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sortObj = (() => {
      const dir = order === "desc" ? -1 : 1;
      if (sort === "answers") return { answerCount: dir };
      if (sort === "views") return { views: dir };
      return { createdAt: dir };
    })();

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question",
          as: "answers",
          pipeline: [{ $match: { isActive: true } }],
        },
      },
      {
        $addFields: {
          answerCount: { $size: "$answers" },
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          score: {
            $subtract: [
              { $size: { $ifNull: ["$likes", []] } },
              { $size: { $ifNull: ["$dislikes", []] } },
            ],
          },
        },
      },
    ];

    if (status === "answered") {
      pipeline.push({ $match: { answerCount: { $gt: 0 } } });
    } else if (status === "unanswered") {
      pipeline.push({ $match: { answerCount: 0 } });
    }

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [{ $project: { username: 1, reputation: 1, avatar: 1 } }],
      },
    });

    pipeline.push({ $unwind: "$author" });

    pipeline.push({
      $project: {
        answers: 1,
        likes: 1,
        dislikes: 1,
        likeCount: 1,
        dislikeCount: 1,
        score: 1,
        title: 1,
        content: 1,
        tags: 1,
        author: 1,
        createdAt: 1,
        views: 1,
        answerCount: 1,
        isEdited: 1,
        updatedAt: 1,
      },
    });

    const questions = await Question.aggregate(pipeline);

    if (req.user) {
      const userId = req.user.id;

      for (const q of questions) {
        const liked = q.likes?.some((l) => l.user?.toString?.() === userId);
        const disliked = q.dislikes?.some(
          (d) => d.user?.toString?.() === userId
        );
        q.userVote = liked ? "like" : disliked ? "dislike" : null;
      }
    } else {
      for (const q of questions) {
        q.userVote = null;
      }
    }

    const totalPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question",
          as: "answers",
          pipeline: [{ $match: { isActive: true } }],
        },
      },
      {
        $addFields: {
          answerCount: { $size: "$answers" },
        },
      },
    ];

    if (status === "answered") {
      totalPipeline.push({ $match: { answerCount: { $gt: 0 } } });
    } else if (status === "unanswered") {
      totalPipeline.push({ $match: { answerCount: 0 } });
    }

    totalPipeline.push({ $count: "total" });

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
    const db = getDB();
    const questionId = new ObjectId(req.params.id);

    const pipeline = [
      { $match: { _id: questionId, isActive: true } },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                username: 1,
                reputation: 1,
                avatar: 1,
                _id: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$author" },

      {
        $lookup: {
          from: "answers",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$question", "$$questionId"] },
                isActive: true,
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      reputation: 1,
                      avatar: 1,
                      _id: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: "$author" },
          ],
          as: "answers",
        },
      },
    ];

    const result = await db
      .collection("questions")
      .aggregate(pipeline)
      .toArray();
    const question = result[0];

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    await db
      .collection("questions")
      .updateOne({ _id: questionId }, { $inc: { views: 1 } });
    question.views += 1;

    if (req.user) {
      const userId = req.user.id;
      const liked = question.likes?.some((l) => l.user?.toString() === userId);
      const disliked = question.dislikes?.some(
        (d) => d.user?.toString() === userId
      );
      question.userVote = liked ? "like" : disliked ? "dislike" : null;
    }

    question.likeCount = question.likes?.length || 0;
    question.dislikeCount = question.dislikes?.length || 0;
    question.score = question.likeCount - question.dislikeCount;

    res.status(200).json({ success: true, question });
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
      tags: tags.map((tag) => tag.trim().toLowerCase()),
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
      question: {
        ...question,
        author,
        answers: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { title, content, tags } = req.body;

    question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags: tags.map((t) => t.trim().toLowerCase()) }),
      },
      { new: true }
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
      question: {
        ...question,
        author,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    await Answer.updateMany(
      { question: req.params.id },
      { $set: { isActive: false } }
    );

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
