import mongoose from 'mongoose';

/**
 * Conversation Schema
 * Stores chat history with the AI Advisor, function calls, and grounded recommendations.
 * RATIONALE (Embedded Messages):
 * Messages are tightly bound to a single conversation lifecycle, read in chronological order,
 * and rarely queried in isolation.
 */
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: 'New Advisor Consultation',
      trim: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system', 'tool'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        toolCalls: [
          {
            name: { type: String },
            arguments: { type: mongoose.Schema.Types.Mixed },
          },
        ],
        toolResults: [
          {
            name: { type: String },
            result: { type: mongoose.Schema.Types.Mixed },
          },
        ],
        recommendedEvIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EV',
          },
        ],
        rangeComfortScores: [
          {
            evId: { type: mongoose.Schema.Types.ObjectId, ref: 'EV' },
            score: { type: Number, min: 0, max: 100 },
            explanation: { type: String },
            factors: {
              dailyNeedKm: Number,
              usableRangeKm: Number,
              acImpact: Boolean,
              bufferPercentage: Number,
            },
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    extractedPreferences: {
      dailyCommuteKm: { type: Number, default: null },
      budgetMax: { type: Number, default: null },
      homeCharging: { type: Boolean, default: null },
      familySize: { type: Number, default: null },
      preferredBodyType: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
