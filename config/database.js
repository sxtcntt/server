import mongoose from "mongoose";

export const connectDatabe = async()=>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        console.log('DBMongoose connect: ',connection.host);
    } catch (error) {
        console.log('DBMongoose connect: ',error);
        process.exit(1);
    }
    
}