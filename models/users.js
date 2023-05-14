import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import  jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },

    password:{
        type:String,
        require:true,
        minlength:[8,"Password must be at least 8 characters long"],
        select:false
    },
    avatar:{
         public_id:String,
         url:String,
    },
    otp:Number,
    createAt:{
        type:Date,
        default:Date.now,
    },
    tasks:[
        {
        title:"String",
        description:"String",
        completed:Boolean,
        createAt:Date,
        },

    ],
    verified:{
        type:Boolean,
        default:false,
    },

    otp_expire:Date,
    resetPasswordOtp:Number,
    resetPasswordOtp_expire:Date

});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

userSchema.methods.getJwTToken = function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_COOKIE_EXPIRE*24*60*60*1000,
    });
};
userSchema.methods.comparenPassword= async function(password){
    return await bcrypt.compareSync(password,this.password);
};
{/*userSchema.index({otp_expire:1},{expireAfterSeconds:0}) */}
export const User = mongoose.model("User",userSchema)