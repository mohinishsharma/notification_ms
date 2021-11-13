const { Schema, model, SchemaTypes } = require('mongoose');

const notificationSchema = new Schema({
  provider: {
    type: String,
    required: true,
    enum: ['email','sms','firebase']
  },
  campaingId: {
    type: SchemaTypes.ObjectId,
    ref: 'ms_notification_campaing'
  },
  templateId: {
    type: SchemaTypes.ObjectId,
    ref: 'ms_notification_template'
  },
  templateData: Object,
  sender: String,
  receiver: String,
  priority: {
    type: Number, // 5 => spot dispatching, 4,3,2,1 => scheduled dispatching at different rate
    default: 5
  },
  subject: String,
  body: String,
  attachments: [String],
  c2a: String,
  disaptched: Date,
  dispatchOn: Date,
  isActive: {
    type: Boolean,
    default: true
  }
},{ timestamps: true, _id: true });

module.exports = model('ms_notification', notificationSchema);