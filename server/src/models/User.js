import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Reference target for: Reviews, Wishlists, ReviewVotes, OwnershipClaims, Conversations
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not expose password hash in default queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    profile: {
      city: { type: String, default: 'Pune' },
      monthlyBudget: { type: Number, min: 0, default: 25000 },
      dailyCommuteKm: { type: Number, min: 1, max: 1000, default: 40 },
      familySize: { type: Number, min: 1, max: 10, default: 4 },
      homeCharging: { type: Boolean, default: true },
      preferredBodyType: {
        type: String,
        enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Crossover', 'Any'],
        default: 'Any',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
