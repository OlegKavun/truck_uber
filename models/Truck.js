const {Schema, model, Types} = require('mongoose');
const data = require('../data/data');

const schema = new Schema({
  created_by: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assigned_to: {
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: [
      data.truck.statuses.free,
      data.truck.statuses.load,
    ],
    default: 'IS',
  },
  type: {
    type: String,
    enum: [...data.truck.types],
    required: true,
  },
  created_date: {type: Date, default: Date.now},
});

module.exports = model('Truck', schema);
