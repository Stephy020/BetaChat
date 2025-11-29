import mongoose from "mongoose";

const connectToMongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("connected to database success")
    } catch (error) {
        console.log("Error connecting to the database", error.message);
    }
};

export default connectToMongoDb;