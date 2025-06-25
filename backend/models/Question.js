import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Question {
  constructor(questionData) {
    this._id = questionData._id;
    this.title = questionData.title;
    this.content = questionData.content;
    this.tags = questionData.tags || [];
    this.author = questionData.author;
    this.views = questionData.views || 0;
    this.isEdited = questionData.isEdited || false;
    this.editedAt = questionData.editedAt;
    this.isActive =
      questionData.isActive !== undefined ? questionData.isActive : true;
    this.createdAt = questionData.createdAt || new Date();
    this.updatedAt = questionData.updatedAt || new Date();
    this.likes = questionData.likes || [];
    this.dislikes = questionData.dislikes || [];
  }

  static async create(questionData) {
    const db = getDB();

    if (!questionData.title || !questionData.content || !questionData.author) {
      throw new Error("Title, content, and author are required");
    }

    const question = new Question({
      ...questionData,
      author: new ObjectId(questionData.author),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
      dislikes:[]
    });

    const result = await db.collection("questions").insertOne(question);
    question._id = result.insertedId;

    return question;
  }

  static async findById(id) {
    const db = getDB();
    const questionData = await db.collection("questions").findOne({
      _id: new ObjectId(id),
      isActive: true,
    });

    return questionData ? new Question(questionData) : null;
  }

  static async find(query = {}, options = {}) {
    const db = getDB();
    const { skip = 0, limit = 10, sort = {} } = options;

    const questions = await db
      .collection("questions")
      .find({ ...query, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return questions.map((questionData) => new Question(questionData));
  }

  static async countDocuments(query = {}) {
    const db = getDB();
    return await db
      .collection("questions")
      .countDocuments({ ...query, isActive: true });
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const db = getDB();
    const { new: returnNew = false } = options;

    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.title || updateData.content || updateData.tags) {
      update.isEdited = true;
      update.editedAt = new Date();
    }

    const result = await db
      .collection("questions")
      .findOneAndUpdate(
        { _id: new ObjectId(id), isActive: true },
        { $set: update },
        { returnDocument: returnNew ? "after" : "before" }
      );

    return result.value ? new Question(result.value) : null;
  }

  static async aggregate(pipeline) {
    const db = getDB();
    const results = await db
      .collection("questions")
      .aggregate(pipeline)
      .toArray();
    return results;
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date();

    if (this._id) {
      const { _id, ...updateData } = this;
      await db
        .collection("questions")
        .updateOne({ _id: new ObjectId(_id) }, { $set: updateData });
    } else {
      const result = await db.collection("questions").insertOne(this);
      this._id = result.insertedId;
    }

    return this;
  }

  async incrementViews() {
    const db = getDB();
    await db
      .collection("questions")
      .updateOne({ _id: new ObjectId(this._id) }, { $inc: { views: 1 } });
    this.views += 1;
  }

  get likeCount() {
    return this.likes.length;
  }

  get dislikeCount() {
    return this.dislikes.length;
  }

  get score() {
    return this.likes.length - this.dislikes.length;
  }
}

export default Question;
