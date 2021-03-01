const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
  assigned_truck: {
    type: Types.ObjectId,
    ref: 'Truck',
    default: null,
  },
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  createdDate: {type: Date, default: Date.now},
  role: {
    type: String,
    enum: ['DRIVER', 'SHIPPER'],
  },
});

module.exports = model('User', schema);
