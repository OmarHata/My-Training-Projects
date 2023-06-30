const mongoose = require("mongoose");

const placesSchema = new mongoose.Schema({
  title: String,
  address: String,
  photos: [String],
});

const LocationModel = mongoose.model(place, placesSchema);

module.exports = LocationModel;
