import mongoose from "mongoose";

beforeAll(async () => {
  // Use a separate test database to avoid wiping real data
  const testMongoUrl = process.env.MONGODB_URL_TEST || "mongodb://localhost:27017/apartment-sewa-test";
  await mongoose.connect(testMongoUrl);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
