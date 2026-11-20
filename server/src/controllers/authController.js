import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/jwt.js';

function generateToken(id) {
  return jwt.sign(
    { id },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, profile } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      // Public registration must never grant elevated admin access.
      role: 'user',
      profile: profile || {},
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update user profile preferences
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export async function updateProfile(req, res, next) {
  try {
    const {
      name,
      city,
      monthlyBudget,
      dailyCommuteKm,
      familySize,
      homeCharging,
      preferredBodyType,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (city !== undefined) user.profile.city = city;
    if (monthlyBudget !== undefined) user.profile.monthlyBudget = Number(monthlyBudget);
    if (dailyCommuteKm !== undefined) user.profile.dailyCommuteKm = Number(dailyCommuteKm);
    if (familySize !== undefined) user.profile.familySize = Number(familySize);
    if (homeCharging !== undefined) user.profile.homeCharging = Boolean(homeCharging);
    if (preferredBodyType !== undefined) user.profile.preferredBodyType = preferredBodyType;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile preferences updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
}
