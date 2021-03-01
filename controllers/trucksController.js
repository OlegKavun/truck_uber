const User = require('../models/User');
const Truck = require('../models/Truck');
const data = require('../data/data');

exports.trucks_get = async (req, res) => {
  try {
    const trucks = await Truck.find({created_by: req.user.userId});
    res.status(200).json({trucks});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.trucks_post = async (req, res) => {
  try {
    const {userId, userRole} = req.user;

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    if (!req.body.type || data.truck.types.indexOf(req.body.type) == -1) {
      return res.status(400).json({message: 'Type not founded'});
    }

    const truck = new Truck({
      created_by: userId,
      type: req.body.type,
    });

    await truck.save();
    res.status(200).json({message: 'Truck created successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.trucks_get_id = async (req, res) => {
  try {
    const truckId = req.params.truckId;
    const {userId, userRole} = req.user;

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const truck = await Truck.findById({
      _id: truckId,
      created_by: userId,
    }, {__v: 0});

    if (!truck) {
      return res.status(400).json({message: 'Truck not founded'});
    }

    res.status(200).json({truck});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.trucks_put_id = async (req, res) => {
  try {
    const truckId = req.params.truckId;
    const {userId, userRole} = req.user;

    if (!req.body.type || data.truck.types.indexOf(req.body.type) == -1) {
      return res.status(400).json({message: 'Type not founded'});
    }

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const truck = await Truck.findById({
      _id: truckId,
      created_by: userId,
    }, {__v: 0});

    if (!truck) {
      return res.status(400).json({message: 'Truck not founded'});
    }

    if (truck.assigned_to == userId) {
      return res.status(400).json({
        message: 'You cannot update truck assigned to you',
      });
    }

    await Truck.updateOne(truck, {type: req.body.type});
    res.status(200).json({message: 'Updated successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.trucks_delete_id = async (req, res) => {
  try {
    const truckId = req.params.truckId;
    const {userId, userRole} = req.user;

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const truck = await Truck.findById({
      _id: truckId,
      created_by: userId,
    }, {__v: 0});

    if (!truck) {
      return res.status(400).json({message: 'Truck not founded'});
    }

    if (truck.assigned_to == userId) {
      return res.status(400).json({
        message: 'You cannot delete truck assigned to you',
      });
    }

    await Truck.deleteOne({_id: truckId});
    res.status(200).json({message: 'Deleted successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.trucks_post_assign_id = async (req, res) => {
  try {
    const truckId = req.params.truckId;
    const {userId, userRole} = req.user;

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const currentTruck = await Truck.findOne({assigned_to: userId});

    if (currentTruck && currentTruck.status == data.truck.statuses.load) {
      return res.status(400).json({
        message: 'Currently you have assigned to track',
      });
    }

    if (currentTruck) {
      await currentTruck.updateOne({assigned_to: null});
    }

    const truck = await Truck.find({
      _id: truckId,
      created_by: userId,
    });

    if (!truck) {
      return res.status(400).json({message: 'Truck not founded'});
    }

    await Truck.findOneAndUpdate({_id: truckId}, {assigned_to: userId});
    await User.findByIdAndUpdate({_id: userId}, {assigned_truck: truckId});
    res.status(200).json({message: 'Truck assigned successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};
