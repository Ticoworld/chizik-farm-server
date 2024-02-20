const mongoose = require('mongoose');

const userEmail = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true },
    }
  )
  const Email = mongoose.model('Email', userEmail)
  module.exports = Email