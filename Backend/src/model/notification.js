import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    channel: {
      type: String,
      required: true,
      enum: ['email', 'sms', 'whatsapp']
    },
    recipient: {
      email: { type: String },
      phone: { type: String }
    },
    content: {
      subject: { type: String }, // For email
      body: { type: String, required: true },
      text: { type: String }, // Plain text version for email
      templateName: { type: String } // For WhatsApp templates
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    retryCount: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying notifications by client and status
notificationSchema.index({ clientId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

