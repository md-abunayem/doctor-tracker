import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
    } catch (error) {
        console.error("MONGODB connecteion error ", error);
        process.exit(1);
    }
}

export default connectDB;