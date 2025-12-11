import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true // Index for faster lookups during authentication
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageStats: {
      emailsSent: { type: Number, default: 0 },
      smsSent: { type: Number, default: 0 },
      whatsappSent: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster API key lookups
clientSchema.index({ apiKey: 1, isActive: 1 });

export default mongoose.model("Client", clientSchema);

