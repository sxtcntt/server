import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from 'cloudinary';
import fs from 'fs';
// import bcrypt from 'bcrypt';

export const register = async (req,res)=>{
    try {
        const  {name, email, password} = req.body;
        const avatar = req.files.avatar.tempFilePath;
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({success:false, message:"User already exists"});
        }
        const otp = Math.floor(Math.random()*1000000);

        const myCloud = await cloudinary.v2.uploader.upload(avatar,{
            folder:"ITApp",
        });
        fs.rmSync("./tmp",{recursive:true});
        // da thanh công phần ảnh resgister
        user = await User.create(
            {
                name,
                email,
                password,
                avatar:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                otp,
                otp_expire:new Date(Date.now()+ process.env.OTP_EXPIRE*60*1000)
            });
                await sendMail(email,'verify your acount',`Your OTP is ${otp}`)

                sendToken(res,user,201,"Your OTP send to email, please verify your account")//utils
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const verify = async (req, res)=>{
    try {
        const otp =Number(req.body.otp);
        const user = await User.findById(req.user._id)
        if(user.otp !== otp || user.otp_expire < Date.now()){
            return res
            .status(400)
            .json({success:false, message:'Invalid OTP or has been Expired'});
        }
        user.verified = true;
        user.otp=null;
        user.otp_expire=null;
        await user.save();
        sendToken(res,user,200,"Account Verified");
    } catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const login = async (req,res)=>{
    try {
        const  { email, password} = req.body;
        if(!email || !password){
            return res
            .status(400)
            .json({success:false, message:"Invalid Email or Password!"});
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res
            .status(400)
            .json({success:false, message:"Invalid Email or Password!"});
        }
        const isMatch = await user.comparenPassword(password);
        if(!isMatch){
            return res
            .status(400)
            .json({success:false, message:"Invalid Email or Password!"});
        }
        sendToken(
            res,
            user,
            200,
            "Login Successful")//utils
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const logout = async (req,res)=>{
    try {
        res.status(500).cookie('token',null,{
            expires: new Date(Date.now()),
        }).json({success:true, message:"Logged out successful !"});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

//#region Task
//new task infor
export const addTask = async (req,res)=>{
    try {
        const {title, description} = req.body;
        const user = await User.findById(req.user._id);
        user.tasks.push(
            {
                title,
                description,
                completed:false,
                createAt:new Date()
            });
        await user.save();
        res.status(200).json({success:true, message: 'Task added successfully'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}
//remover task
export const removeTask = async (req,res)=>{
    try {
        const {taskId} = req.params;
        const user = await User.findById(req.user._id);
        user.tasks= user.tasks.filter(task => task._id.toString() !== taskId.toString());
        await user.save();
        res.status(200).json({success:true, message: 'Task removed successfully'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}
//update tasks-> completed -> true -> false and round
export const updateTask = async (req,res)=>{
    try {
        const {taskId} = req.params;
        const user = await User.findById(req.user._id);

        user.task= user.tasks.find(
            (task)=> task._id.toString() === taskId.toString()
        );
        user.task.completed = !user.task.completed; //update completed true or false
        await user.save();
        res.status(200).json({success:true, message: 'Task Updated successfully'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}
//#endregion
//#region Profile
export const getMyProfile = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        sendToken(
            res,
            user,
            201,
            `Welcome back ${user.name}`)
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const updateMyProfile = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        const {name} = req.body;

        const avatar = req.files.avatar.tempFilePath;
        if(name) user.name = name;
        if(avatar){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id,{
                folder:"ITApp",
            });
            const myCloud = await cloudinary.v2.uploader.upload(avatar,{
                folder:"ITApp",
            });
            fs.rmSync("./tmp",{recursive:true});
            user.avatar={
                public_id: myCloud.public_id,
                url:myCloud.secure_url,
            }
        }
        user.save();
        res.status(200).json({success:true, message: 'Profile Updated successfully'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const updatePassword = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id).select('+password');
        let {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){
            res.status(400).json({success:false, message: 'Please enter all flieds'});
            return;
        }
        let isMatch = await user.comparenPassword(oldPassword);

        if(!isMatch){
            res.status(400).json({success:false, message: 'Invalid Old Password'});
            return;
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({success:true, message: 'Password Updated successfully'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

//forgotpassword
export const forgotPassword = async (req,res)=>{
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message: `Invalid Email: ${email}`})
        }
        const otp = Math.floor(Math.random()*1000000);
        user.resetPasswordOtp = otp;
        user.resetPasswordOtp_expire=Date.now() + 10*60*1000;//+10p

        await user.save();

        const message = `You OTP for resseting the password ${otp}, If you did not request for this, please ignore this email.`;
        await sendMail(email,'Request for your Account OTP resset password',message)

        res.status(200).json({success:true, message: `OTP send to ${email}`});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}

export const resetPassword = async (req,res)=>{
    try {
        const {otp, newPassword} = req.body;
        const user = await User.findOne(
            {
                resetPasswordOtp: otp,
                resetPasswordOtp_expire:{$gt: Date.now()},
            }).select('+password');
        if(!user){
            return res.status(400).json({success:false, message: 'OTP invalid or has been Expired'})
        }
        user.password = newPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtp_expire=null;

        await user.save();
        res.status(200).json({success:true, message: 'Password change successful'});
    }
    catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
}


//#endregion