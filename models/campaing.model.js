const { Schema, model, SchemaTypes } = require('mongoose');

const campaingSchema = new Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  provider: {
    type: String,
    required: true,
    enum: ['email','sms','firebase']
  },
  receivers: [String],
  sender: String,
  templateId: {
    type: SchemaTypes.ObjectId,
    ref: 'ms_notification_template'
  },
  subject: String,
  body: String,
  attachments: [String],
  c2a: String,
  dispatched: Date
}, { timestamps: true, _id: true });

module.exports = model('ms_notification_campaing', campaingSchema);
