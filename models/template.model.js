const { Schema, model } = require('mongoose');

const templateSchema = new Schema({
  provider: {
    type: String,
    required: true,
    enum: ['email','sms','firebase']
  },
  renderer: {
    type: String,
    default: 'handlebar',
    enum: ['handlebar']
  },
  template: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, _id: true });

module.exports = model('ms_notification_templates', templateSchema);