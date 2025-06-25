import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';

class User {
  constructor(userData) {
    this._id = userData._id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.bio = userData.bio || '';
    this.location = userData.location || '';
    this.website = userData.website || '';
    this.reputation = userData.reputation || 0;
    this.avatar = userData.avatar || '';
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  static async create(userData) {
    const db = getDB();
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      throw new Error(existingUser.email === userData.email 
        ? 'Email already registered' 
        : 'Username already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId;

    return user;
  }

  static async findById(id) {
    const db = getDB();
    const userData = await db.collection('users').findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });
    
    return userData ? new User(userData) : null;
  }

  static async findByEmail(email) {
    const db = getDB();
    const userData = await db.collection('users').findOne({ 
      email,
      isActive: true 
    });
    
    return userData ? new User(userData) : null;
  }

  static async findByEmailWithPassword(email) {
    const db = getDB();
    const userData = await db.collection('users').findOne({ 
      email,
      isActive: true 
    });
    
    return userData ? new User(userData) : null;
  }

  static async find(query = {}, options = {}) {
    const db = getDB();
    const { skip = 0, limit = 20, sort = {} } = options;
    
    const users = await db.collection('users')
      .find({ ...query, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return users.map(userData => new User(userData));
  }

  static async countDocuments(query = {}) {
    const db = getDB();
    return await db.collection('users').countDocuments({ ...query, isActive: true });
  }

  async save() {
    const db = getDB();
    this.updatedAt = new Date();

    if (this._id) {
      const { _id, ...updateData } = this;
      await db.collection('users').updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );
    } else {
      const result = await db.collection('users').insertOne(this);
      this._id = result.insertedId;
    }

    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const { password, ...userObject } = this;
    return userObject;
  }
}

export default User;