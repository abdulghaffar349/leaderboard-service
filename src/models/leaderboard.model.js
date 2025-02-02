import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const leaderboardSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  scores: [scoreSchema]
});

// Index for gameId lookups
leaderboardSchema.index({ gameId: 1 });
// Compound index for scores array
leaderboardSchema.index({ 'scores.score': -1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;