import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      location: user.location,
      website: user.website,
      reputation: user.reputation,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({
      username,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, bio, location, website } = req.body;

    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },
          {
            $or: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already taken"
              : "Username already taken",
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "Strict",
    secure: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
