import express from "express"
import { register,login,logout, verifyEmail ,verifyOtp, isAuthenticated, resetPasswordOtp, resetPassword} from "../controllers/auth.controller.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, verifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp",  resetPasswordOtp);
authRouter.post("/reset-password",  resetPassword);




export default authRouter