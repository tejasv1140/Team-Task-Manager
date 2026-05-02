const mongoose = require('mongoose');

const isLocalMongoUri = (uri) => /mongodb(\+srv)?:\/\/(localhost|127\.0\.0\.1|\[?::1\]?)/i.test(uri);

const connectDB = async () => {
  try {
    const mongoUris = [
      process.env.MONGO_URL,
      process.env.MONGODB_URI,
      process.env.MONGODB_URL
    ].filter(Boolean);

    const mongoUri = process.env.NODE_ENV === 'production'
      ? mongoUris.find(uri => !isLocalMongoUri(uri))
      : mongoUris[0];

    if (!mongoUri) {
      throw new Error('Missing production MongoDB connection string. In Railway, set MONGODB_URI to ${{Mongo.MONGO_URL}} or remove any localhost Mongo URL.');
    }

    if (process.env.NODE_ENV === 'production' && isLocalMongoUri(mongoUri)) {
      throw new Error('MongoDB URL points to localhost. In Railway, set MONGODB_URI to ${{Mongo.MONGO_URL}} instead.');
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
