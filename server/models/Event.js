const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    eventMode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true,
    },
    venue: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    eventDateTime: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    teamMinSize: {
      type: Number,
      required: true,
      min: 1,
    },
    teamMaxSize: {
      type: Number,
      required: true,
      min: 1,
    },
    registrationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalRegistrations: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
