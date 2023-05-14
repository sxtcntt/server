import express from 'express';
import { addTask, forgotPassword, getMyProfile, login, logout, register, removeTask, resetPassword, updateMyProfile, updatePassword, updateTask, verify } from '../controllers/User.js';
import { isAuthenticated } from '../middleware/auth.js';
const router = express.Router();

router.route("/register").post(register); //name,email,password,avatar(files image)
router.route("/verify").post(isAuthenticated, verify);//otp
router.route("/login").post(login);//email,password
router.route("/logout").get(logout);
router.route("/newtask").post(isAuthenticated, addTask);//title, description
router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/updateprofile").put(isAuthenticated, updateMyProfile);//name, avatar(files image)
router.route("/updatepassword").put(isAuthenticated, updatePassword) //oldPassword, newPassword
router.route("/forgotpassword").post(forgotPassword) //email
router.route("/resetPassword").put(resetPassword) //email
router
    .route("/task/:taskId")
    .get(isAuthenticated, updateTask)
    .delete(isAuthenticated, removeTask);

export default router;