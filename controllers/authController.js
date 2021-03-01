const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('config');
const generator = require('generate-password');

const schemaReg = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
  role: Joi.string().required(),
});

const schemaLog = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
});

exports.auth_register_post = async (req, res) => {
  try {
    const {email, password, role} = req.body;

    const value = schemaReg.validate({email, password, role});

    if (value.error) {
      return res.status(400).json({message: value.error.message});
    }

    const person = await User.findOne({email});

    if (person) {
      return res.status(400).json({
        message: 'This user already exist',
      });
    }

    const hashedpassword = await bcrypt.hash(password, 12);

    const user = new User({
      email, password: hashedpassword, role,
    });

    await user.save();
    res.status(200).json({message: 'Success'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.auth_login_post = async (req, res) => {
  try {
    const {email, password} = req.body;

    const value = schemaLog.validate({email, password});

    if (value.error) {
      return res.status(400).json({message: value.error.message});
    }

    const user = await User.findOne({email});

    if (!user) {
      return res.status(400).json({message: 'User not found'});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Wrong password. Please try agein',
      });
    }

    const token = jwt.sign({
      userId: user.id,
      userRole: user.role,
    },
    config.get('jwtSecret'),
    {
      expiresIn: '1h',
    },
    );

    res.status(200).json({message: 'Success', jwt_token: token});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.auth_forgotPassword_post = async (req, res) => {
  try {
    const {email} = req.body;
    const user = await User.findOne({email});

    if (!user) {
      return res.status(400).json({message: 'User not found'});
    }

    const password = generator.generate({
      length: 10,
      numbers: true,
    });

    const hashedpassword = await bcrypt.hash(password, 12);

    await User.updateOne(user, {password: hashedpassword});

    console.log(password);
    res.status(200).json({message: 'New password sent to your email address'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};
