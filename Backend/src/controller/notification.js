import Notification from "../model/notification.js";
import kafkaProducer from "../kafka/producer.js";


export const sendNotification = async (req, res) => {
  try {
    const { channel, recipient, content } = req.body;

    // Validation
    if (!channel || !recipient || !content) {
      return res.status(400).json({
        success: false,
        message: "channel, recipient, and content are required"
      });
    }

    // Validate channel
    if (!['email', 'sms', 'whatsapp'].includes(channel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel. Must be: email, sms, or whatsapp"
      });
    }

    // Validate recipient based on channel
    if (channel === 'email' && !recipient.email) {
      return res.status(400).json({
        success: false,
        message: "Email address required for email channel"
      });
    }

    if ((channel === 'sms' || channel === 'whatsapp') && !recipient.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required for SMS/WhatsApp channel"
      });
    }

    // Validate content
    if (!content.body) {
      return res.status(400).json({
        success: false,
        message: "Content body is required"
      });
    }

    // Create notification record with PENDING status
    const notification = await Notification.create({
      clientId: req.client._id,
      channel,
      recipient,
      content,
      status: "PENDING"
    });

    console.log(`📝 [Notification] Created: ${notification._id} (${channel})`);

    // Publish event to Kafka
    try {
      await kafkaProducer.sendNotificationEvent({
        _id: notification._id,
        clientId: notification.clientId,
        channel: notification.channel,
        recipient: notification.recipient,
        content: notification.content,
        status: notification.status,
        createdAt: notification.createdAt
      });

      res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        data: {
          notificationId: notification._id,
          channel: notification.channel,
          status: notification.status,
          createdAt: notification.createdAt
        }
      });

    } catch (kafkaError) {
      // If Kafka fails, mark notification as failed
      notification.status = "FAILED";
      notification.errorMessage = `Kafka error: ${kafkaError.message}`;
      await notification.save();

      console.error(`❌ [Notification] Kafka publish failed for ${notification._id}`);

      return res.status(500).json({
        success: false,
        message: "Failed to queue notification",
        error: kafkaError.message
      });
    }

  } catch (err) {
    console.error('❌ [Notification] Error:', err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: err.message
    });
  }
};


export const getNotifications = async (req, res) => {
  try {
    const { channel, status, limit = 50, page = 1 } = req.query;

    const query = { clientId: req.client._id };

    if (channel) {
      if (!['email', 'sms', 'whatsapp'].includes(channel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid channel filter"
        });
      }
      query.channel = channel;
    }

    if (status) {
      if (!['PENDING', 'PROCESSING', 'SENT', 'FAILED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter"
        });
      }
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Notification.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('❌ [Notifications] Query error:', err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      clientId: req.client._id // Ensure client can only see their own notifications
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });

  } catch (err) {
    console.error('❌ [Notification] Fetch error:', err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: err.message
    });
  }
};

export default { sendNotification, getNotifications, getNotificationById };
