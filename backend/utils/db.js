import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully');
        // await mongoose.connect(process.env.MONGO_URI, {
        //     serverSelectionTimeoutMS: 5000, // Increase timeout
        //     socketTimeoutMS: 45000, // Keep the connection alive longer
        //   });
          console.log("MongoDB Connected");
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;