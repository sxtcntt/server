import express from 'express';
import User from "./routers/User.js"
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
export const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(fileUpload({
    limits:{fileSize:50 * 1024 *1024},
    useTempFiles:true,
}));
app.use(cors());

app.use("/api/v1",User);

app.get("/",(req,res)=>{
    res.send("Server is Working");
})
