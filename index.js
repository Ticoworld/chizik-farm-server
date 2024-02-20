const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
app.use(cors())
app.use(express.json());
const dotenv = require('dotenv');
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const Admin = require('./models/admin')
const userEmails = require('./models/user-emails');
const mongoose = require('mongoose');
dotenv.config();

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI);

app.post('/api/admin/register', async (req, res) => {

  try {
    const {email, password} = req.body
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await Admin.create({
      email,
      password: hashedPassword
    })
    res.json({status: 'ok'});
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ status: 'error', error: 'Duplicate Email' });
    }

    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});


app.post('/api/admin/login', async (req, res) => {
    const admin = await Admin.findOne({ email: req.body.email });

    if (admin) {
      const isPasswordValid = bcrypt.compare(req.body.password, admin.password) ;

      if(isPasswordValid) {
      const token = jwt.sign({
        email: admin.email,
      }, 'secret123');

      return res.json({ status: 'ok', admin: token });
    }
     else {
      return res.json({ status: 'error', admin: false });
    }
  }  else {
    return res.json({status: 'error', admin: false});
  }
});


  app.post('/api/emails', async (req, res) => {
    try {
      const email = req.body.email;
      await userEmails.create({
        email
      });
      res.json({ status: 'ok' }); 
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error' }); 
    }
  });

  app.get('/api/subscribers', async (req, res) => {
    try {
      const allSubscribers = await userEmails.find({});
      res.json({
        status: 'ok',
        emails: allSubscribers,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', message: 'Server error' });
    } 
  })
  

  const port = process.env.PORT



app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
})

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
  
  // Listen for the 'error' event
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  // Listen for the 'disconnected' event
  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
  });
  
  // Gracefully close the MongoDB connection on application termination
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  });