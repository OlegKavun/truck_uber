const express = require('express');
const app = express();
const config = require('config');
const mongoose = require('mongoose');
const logs = require('./middlewares/logs.middleware.js');
const auth = require('./middlewares/auth.middleware');

const PORT = process.env.PORT ?? config.get('PORT');

app.use(express.json());
app.use('/api/auth', logs, require('./routes/auth.router'));
app.use('/api/users', logs, auth, require('./routes/users.router'));
app.use('/api/trucks', logs, auth, require('./routes/trucks.route'));
app.use('/api/loads', logs, auth, require('./routes/load.route'));

const start = async () => {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server run on port ${PORT}`);
    });
  } catch (e) {
    console.log('Server Error', e.message);
  }
};

start();


