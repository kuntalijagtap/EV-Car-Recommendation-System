import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { EV } from '../models/EV.js';
import { getMostWishlistedEVs } from '../aggregations/mostWishlistedEVs.js';

/**
 * @desc    Get logged-in user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'evId',
        populate: { path: 'brandId', select: 'name logoUrl originCountry' },
      })
      .sort({ createdAt: -1 });

    const evs = items
      .filter((item) => item.evId !== null)
      .map((item) => ({
        wishlistId: item._id,
        notes: item.notes,
        addedAt: item.createdAt,
        ev: item.evId,
      }));

    res.status(200).json({
      success: true,
      count: evs.length,
      data: evs,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Add an EV to user's wishlist (M:N junction)
 * @route   POST /api/wishlist
 * @access  Private
 */
export async function addToWishlist(req, res, next) {
  try {
    const { evId, notes } = req.body;

    if (!evId || !mongoose.Types.ObjectId.isValid(evId)) {
      return res.status(400).json({ success: false, message: 'Valid evId is required.' });
    }

    const evExists = await EV.findById(evId);
    if (!evExists) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: req.user._id, evId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Vehicle is already in your wishlist.',
        data: existing,
      });
    }

    const item = await Wishlist.create({
      userId: req.user._id,
      evId,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added to wishlist successfully.',
      data: item,
    });
  } catch (error) {
    // Catch duplicate key error if race condition occurs
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Vehicle is already in your wishlist.',
      });
    }
    next(error);
  }
}

/**
 * @desc    Remove an EV from user's wishlist
 * @route   DELETE /api/wishlist/:evId
 * @access  Private
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const { evId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evId)) {
      return res.status(400).json({ success: false, message: 'Invalid evId format.' });
    }

    const result = await Wishlist.findOneAndDelete({
      userId: req.user._id,
      evId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found in your wishlist.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Check if an EV is in the logged-in user's wishlist
 * @route   GET /api/wishlist/check/:evId
 * @access  Private
 */
export async function checkWishlist(req, res, next) {
  try {
    const { evId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evId)) {
      return res.status(400).json({ success: false, message: 'Invalid evId format.' });
    }

    const item = await Wishlist.findOne({ userId: req.user._id, evId });

    res.status(200).json({
      success: true,
      inWishlist: Boolean(item),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get trending most wishlisted EVs (Pipeline 4)
 * @route   GET /api/wishlist/trending
 * @access  Public
 */
export async function getTrendingWishlist(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    const trending = await getMostWishlistedEVs(limit);

    res.status(200).json({
      success: true,
      count: trending.length,
      data: trending,
    });
  } catch (error) {
    next(error);
  }
}
