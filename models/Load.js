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
  pickup_address: String,
  delivery_address: String,
  status: {
    type: String,
    enum: [...data.load.statuses],
    required: true,
    default: 'NEW',
  },
  state: {
    type: String,
    enum: [...data.load.states],
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  payload: Number,
  name: String,
  created_date: {type: Date, default: Date.now},
  logs: [{
    message: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
});

module.exports = model('Load', schema);
