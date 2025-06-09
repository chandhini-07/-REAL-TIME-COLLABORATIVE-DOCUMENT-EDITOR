const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  _id: String,
  content: String
});

module.exports = mongoose.model('Document', DocumentSchema);
