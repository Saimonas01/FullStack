import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';

class Answer {
  constructor(answerData) {
    this._id = answerData._id;
    this.content = answerData.content;
    this.question = answerData.question;
    this.author = answerData.author;
    this.likes = answerData.likes || [];
    this.dislikes = answerData.dislikes || [];
    this.isEdited = answerData.isEdited || false;
    this.editedAt = answerData.editedAt;
    this.isActive = answerData.isActive !== undefined ? answerData.isActive : true;
    this.createdAt = answerData.createdAt || new Date();
    this.updatedAt = answerData.updatedAt || new Date();
  }

  static async create(answerData) {
    const db = getDB();
    
    if (!answerData.content || !answerData.question || !answerData.author) {
      throw new Error('Content, question, and author are required');
    }

    const answer = new Answer({
      ...answerData,
      question: new ObjectId(answerData.question),
      author: new ObjectId(answerData.author),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await db.collection('answers').insertOne(answer);
    answer._id = result.insertedId;

    return answer;
  }

  static async findById(id) {
    const db = getDB();
    const answerData = await db.collection('answers').findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });
    
    return answerData ? new Answer(answerData) : null;
  }

  static async find(query = {}, options = {}) {
    const db = getDB();
    const { skip = 0, limit = 10, sort = {} } = options;
    
    const answers = await db.collection('answers')
      .find({ ...query, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return answers.map(answerData => new Answer(answerData));
  }

  static async countDocuments(query = {}) {
    const db = getDB();
    return await db.collection('answers').countDocuments({ ...query, isActive: true });
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const db = getDB();
    const { new: returnNew = false } = options;

    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.content) {
      update.isEdited = true;
      update.editedAt = new Date();
    }

    const result = await db.collection('answers').findOneAndUpdate(
      { _id: new ObjectId(id), isActive: true },
      { $set: update },
      { returnDocument: returnNew ? 'after' : 'before' }
    );


    return result ? new Answer(result) : null;
  }

  static async aggregate(pipeline) {
    const db = getDB();
    const results = await db.collection('answers').aggregate(pipeline).toArray();
    return results;
  }

  static async updateMany(query, update) {
    const db = getDB();
    return await db.collection('answers').updateMany(query, update);
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date();

    if (this._id) {
      const { _id, ...updateData } = this;
      await db.collection('answers').updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );
    } else {
      const result = await db.collection('answers').insertOne(this);
      this._id = result.insertedId;
    }

    return this;
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

export default Answer;