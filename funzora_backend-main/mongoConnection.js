const mongoose = require('mongoose');
const config = require('./app/config');

// MongoDB Connection Setup
// mongoose.connect(`mongodb+srv://kshirsagars234:123123123@shubham.eiovjmm.mongodb.net/onlinesales`)
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ob7zcad.mongodb.net/?appName=Cluster0`;
console.log(uri); // Log the URI to ensure it's correct
mongoose
  .connect(uri)
  .then(() => {
    console.log("MONGODB CONNECTED SUCCESSFULLY!!");
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION ERROR!!");
    console.error(error);
  });


module.exports = mongoose;
