import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from .env.local.");
}

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = {
    connection: null,
    promise: null,
  };
}

export async function connectDatabase() {
  if (globalForMongoose.mongoose.connection) {
    return globalForMongoose.mongoose.connection;
  }

  if (!globalForMongoose.mongoose.promise) {
    globalForMongoose.mongoose.promise = mongoose.connect(MONGO_URI);
  }

  globalForMongoose.mongoose.connection =
    await globalForMongoose.mongoose.promise;

  return globalForMongoose.mongoose.connection;
}