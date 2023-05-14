import { app } from "./app.js";
import { config } from "dotenv";
import { connectDatabe } from "./config/database.js";
import cloudinary from 'cloudinary';
config({
    path:"./config/config.env",
})
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})
connectDatabe();
app.listen(process.env.PORT || 10601, ()=>{
    console.log("Server running is PORT: "+process.env.PORT);
});