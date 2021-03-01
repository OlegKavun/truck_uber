const Joi = require('joi');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const validation = Joi.object({
  password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});


exports.me_get = async (req, res) => {
  try {
    const user = await User.findById({_id: req.user.userId}, {
      _id: 1,
      email: 1,
      createdDate: 1,
    });
    res.status(200).json({user});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};


exports.me_delete = async (req, res) => {
  try {
    const {userRole} = req.user;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    await User.findByIdAndDelete({_id: req.user.userId}, (err) => {
      if (err) {
        return res.status(400).json({message: e.message});
      }
    });
    res.status(200).json({message: 'Profile deleted successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};


exports.me_password = async (req, res) => {
  try {
    const {oldPassword, newPassword} = req.body;

    await validation.validateAsync({password: newPassword});
    const user = await User.findOne({
      _id: req.user.userId,
    });

    const isMatch = await bcrypt
        .compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Wrong oldPassword. Please try agein',
      });
    }

    const hashedpassword = await bcrypt.hash(newPassword, 12);

    await User.updateOne(user, {password: hashedpassword});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};
