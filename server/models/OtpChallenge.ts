import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpChallenge extends Document {
  challengeId: string;
  adminId: string;
  username: string;
  emailOtpHash: string;
  smsOtpHash: string;
  expiresAt: Date;
  attempts: number;
  resendCooldownUntil: Date;
  createdAt: Date;
}

const OtpChallengeSchema = new Schema<IOtpChallenge>(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    adminId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    emailOtpHash: {
      type: String,
      required: true,
    },
    smsOtpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete on expiration in MongoDB
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendCooldownUntil: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OtpChallenge =
  mongoose.models.OtpChallenge || mongoose.model<IOtpChallenge>('OtpChallenge', OtpChallengeSchema);
