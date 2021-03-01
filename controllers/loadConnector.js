const Load = require('../models/Load');
const User = require('../models/User');
const Truck = require('../models/Truck');
const data = require('../data/data');
const Joi = require('joi');

const loadValidate = Joi.object({
  name: Joi.string().required(),
  payload: Joi.number().required(),
  pickup_address: Joi.string().required(),
  delivery_address: Joi.string().required(),
  dimensions: {
    length: Joi.number().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
  },
});

exports.loads_get = async (req, res) => {
  try {
    let loads;
    const skip = req.query.offset ?? 0;
    const limit = req.query.limit ?? 10;

    const {userId, userRole} = req.user;

    if (userRole == 'DRIVER') {
      loads = await Load.find({
        assigned_to: userId,
      }).skip(skip).limit(limit);
    }

    if (userRole == 'SHIPPER') {
      loads = await Load.find({
        created_by: userId,
      }).skip(skip).limit(limit);
    }

    if (!loads) {
      return res.status(400).json({message: 'Loads not found'});
    }

    res.status(200).json({loads});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_post = async (req, res) => {
  try {
    const {userId, userRole} = req.user;
    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const value = loadValidate.validate({...req.body});

    if (value.error) {
      return res.status(400).json({message: value.error.message});
    }

    const {
      name,
      payload,
      pickupAddress,
      deliveryAddress,
      dimensions,
    } = req.body;

    const load = new Load({
      created_by: userId,
      name,
      payload,
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      dimensions,
    });

    await load.save();
    res.status(200).json({message: 'Load created successfully'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_active_get = async (req, res) => {
  try {
    const {userId, userRole} = req.user;
    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.findOne({
      assigned_to: userId,
      status: 'ASSIGNED',
    }, {__v: 0, logs: {_id: 0}});
    if (!load) {
      return res.status(400).json({
        message: 'You dont have active loads',
      });
    }

    res.status(200).json({load});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_active_state_patch = async (req, res) => {
  try {
    const states = data.load.states;
    const {userId, userRole} = req.user;

    if (userRole !== 'DRIVER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.findOne({
      assigned_to: userId, status: 'ASSIGNED',
    });

    if (!load) {
      return res.status(400).json({
        message: 'You dont have active loads',
      });
    }

    const currentState = states.indexOf(load.state)+1;


    if (currentState == states.length - 1) {
      await load.updateOne({
        state: states[currentState],
        status: 'SHIPPED',
        $push: {
          logs: {
            message:
              `Load changed from ${load.state} to ${states[currentState]}`,
          },
        },
      });
      await Truck.findOneAndUpdate({assigned_to: load.assigned_to}, {
        status: data.truck.statuses.free,
      });
    } else {
      await load.updateOne({
        state: states[currentState],
        $push: {
          logs: {
            message:
            `Load state changed from ${load.state} to ${states[currentState]}`,
          },
        },
      });
    }

    res.status(200).json({
      message:
        `Load state changed to ${states[currentState]}`,
    });
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_id_get = async (req, res) => {
  try {
    const {userId, userRole} = req.user;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.find({
      _id: req.params.loadId,
      created_by: userId,
    }, {__v: 0, logs: {_id: 0}});

    if (!load) {
      return res.status(400).json({message: 'Load not found'});
    }

    res.status(200).json({load});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_id_put = async (req, res) => {
  try {
    const {userId, userRole} = req.user;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const value = loadValidate.validate({...req.body});

    if (value.error) {
      return res.status(400).json({message: value.error.message});
    }

    const load = await Load.findOne({
      _id: req.params.loadId,
      status: 'NEW',
      created_by: userId,
    });

    if (!load) {
      return res.status(400).json({message: 'Load not found'});
    }

    await Load.updateOne(load, {...req.body});

    res.status(200).json({
      message: `Load details changed successfully`,
    });
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_id_delete = async (req, res) => {
  try {
    const {userId, userRole} = req.user;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.findOneAndDelete({
      _id: req.params.loadId,
      status: 'NEW',
      created_by: userId,
    });

    if (!load) {
      return res.status(400).json({message: 'Load not found'});
    }

    res.status(200).json({message: `Load deleted successfully`});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_id_post = async (req, res) => {
  try {
    const {userRole} = req.user;
    const loadId = req.params.loadId;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.findByIdAndUpdate({
      _id: loadId,
    }, {status: 'POSTED'});

    if (!load) {
      return res.status(400).json({
        message: 'Load not found',
      });
    }

    const {
      length: loadLen,
      width: loadWdt,
      height: loadHgt,
    } = load.dimensions;
    const loadPld = load.payload;

    const neededCars = data.truck.dims.filter( (el) => {
      return el.length >= +loadLen &&
      el.width >= +loadWdt &&
      el.height >= +loadHgt &&
      el.weight >= +loadPld;
    },
    ).map( (truck) => truck.name);

    let foundedDriver;
    await User.find({role: 'DRIVER'})
        .populate('assigned_truck')
        .then( (driver) => {
          foundedDriver = driver.find( (dr) => {
            return dr.assigned_truck.status == 'IS' ?
          neededCars.includes(dr.assigned_truck.type) :
          false;
          });
        });

    let message;

    if (!!foundedDriver) {
      await foundedDriver.assigned_truck.updateOne({
        status: 'OL',
      });
      await load.updateOne({
        state: 'En route to Pick Up',
        status: 'ASSIGNED',
        assigned_to: foundedDriver._id,
        $push: {
          logs: {
            message:
            `For ${load._id} fouded driver ${foundedDriver._id}
            * status changed to 'ASSIGNED'`,
          },
        }});
      message = 'Load posted successfully';
    } else {
      await load.updateOne({
        status: 'NEW',
        $push: {
          logs: {
            message: `Driver not found *** status changed to 'NEW'`,
          },
        }});
      message = 'Driver not found';
    }

    res.status(200).json({
      message,
      driver_found: !!foundedDriver,
    });
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

exports.loads_id_info_get = async (req, res) => {
  try {
    const {userRole} = req.user;

    if (userRole !== 'SHIPPER') {
      return res.status(400).json({
        message: 'You dont have permission for operation',
      });
    }

    const load = await Load.findById({_id: req.params.loadId}, {__v: 0});

    if (!load) {
      return res.status(400).json({message: 'Load not found'});
    }

    await User.findOne({_id: load.assigned_to})
        .populate('assigned_truck')
        .then( (driver) => {
          return res.status(200).json({load, truck: driver.assigned_truck});
        });

    return res.status(200).json({load});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};
