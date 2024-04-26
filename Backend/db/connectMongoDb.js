import mongoose from "mongoose";

const connectToMongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("connected to database success")
    } catch (error) {
        console.log("Error connectiong to the database", error.massage);
    }
};

export default connectToMongoDb;