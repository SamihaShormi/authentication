import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => { 
    const {name, email, password} = req.body;
    if(!email || !name || !password){
        return res.json({success:false , message:"All fields are required"});
    }
    try{
        const existingUser= await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false , message:"User already exists"});
        }
        const hassedPassword= await bcrypt.hash(password, 10);
        const user= new userModel({name , email, password:hassedPassword});
        await user.save();
        const token =jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie("token", token, {
            httpOly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        // sending welcome email
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to:email,
            subject:"Welcome to our website",
            text:`Welcome to our website. Your account has been created with email: ${email}`
        }
        await transporter.sendMail(mailOptions);
       

        return res.json({success:true , message:"User registered successfully"});
    }
    catch(error){
        console.log(error);
        res.json({success:false, message:"Something went wrong"});
    }}


export const login = async (req, res) => {
    const {email, password} = req.body; 

    if(!email || !password){
        return res.json({success:false , message:"All fields are required"});
  }

  try{
    const user= await userModel.findOne({email});
    if(!user){
        return res.json({success:false , message:"User does not exist"});
    }
    const isPasswordValid= await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.json({success:false , message:"Invalid password"});
    }
    const token =jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"});
    res.cookie("token", token, {
        httpOly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({success:true , message:"User registered successfully"});

  }
catch(error){
    res.json({success:false, message:"Something went wrong"});
}

}


export const logout = (req, res) => {
    try{
    res.cookie("token", null, {
        httpOly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({success:true , message:"User logged out successfully"});}
    catch(error){
        res.json({success:false, message:"Something went wrong"});
    }
}


export const verifyOtp = async (req, res) => {
    try {
        const { userid } = req.body;
        // console.log("Received userid:", userid); // Debugging log

        if (!userid) {
            return res.json({ success: false, message: "Missing userid" });
        }

        const user = await userModel.findById(userid);
        // console.log("Found user:", user); // Debugging log

        if (!user) {
            return res.json({ success: false, message: "User not found in DB" });
        }

        if (user.isVerified) {
            return res.json({ success: false, message: "Account is already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your account",
            text: `Your verification code is: ${otp}. Verify your account using this OTP.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        // console.error("Error in verifyOtp:", error);
        res.json({ success: false, message: "Something went wrong" });
    }
};




    export const verifyEmail= async (req, res) => {
        const {otp,userid}=req.body;
        if(!otp || !userid){
            return res.json({success:false , message:"missing fields"});
        }
        try{
            const user= await userModel.findById(userid);
            if(!user){
                return res.json({success:false , message:"User does not exist"});
            }
            if(user.verifyOtp !== otp || user.verifyOtp===''){
                return res.json({success:false , message:"Invalid otp"});
            }
            if(user.verifyOtpExpireAt < Date.now()){
                return res.json({success:false , message:"Otp expired"});
            }
            user.isVerified=true;
            user.verifyOtpExpireAt=0;
            user.verifyOtp='';
            await user.save();
            return res.json({success:true , message:"User verified successfully"});
        }
        catch(error){
            res.json({success:false, message:"Something went wrong"});
        }



};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true});
    } catch (error) {
        return res.json({ success: false, message: "Not authorized. Login again" });
    }
}



export const resetPasswordOtp = async (req, res) => {
    const{email}=req.body;
    if(!email){
        return res.json({success:false , message:"Email is required"});
    }
    try{
        const user= await userModel.findOne({email});
        if(!user){
            return res.json({success:false , message:"User does not exist"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetoOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15  * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset your password",
            text: `Your reset password code is: ${otp}. Reset your password using this OTP.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP sent successfully" });
    }
    catch(error){
        res.json({success:false, message:"Something went wrong"});
    }
}

export const resetPassword= async (req, res) => {
    const {otp,email,newPassword}=req.body;
    if(!otp || !email || !newPassword){
        return res.json({success:false , message:"missing fields"});
    }
    try{
        const user= await userModel.findById(user.id);
        if(!user){
            return res.json({success:false , message:"User does not exist"});
        }
        if(user.resetOtp !== otp || user.resetOtp===''){
            return res.json({success:false , message:"Invalid otp"});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false , message:"Otp expired"});
        }
        const hassedPassword= await bcrypt.hash(password, 10);
        user.password=hassedPassword;
        user.resetOtpExpireAt=0;
        user.resetOtp='';    
        await user.save();                
        return res.json({success:true , message:"Password reset successfully"});        
    }
    catch(error){
        res.json({success:false, message:"Something went wrong"});
    }
}