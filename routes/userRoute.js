import express from 'express'
import { bookService, cancelSeviceBooking, getProfile, listService, loginUser, paymentRazorpay, registerUser, updateProfile, verifyRazorpay } from '../controllers/userController.js'
import authUser from '../middleware/authUser.js'
import upload from '../middleware/multer.js'


const userRouter = express.Router()


userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get("/get-profile",authUser,getProfile);
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile) 
userRouter.post("/book-service",  authUser, bookService)
userRouter.get("/service-bookings",  authUser, listService)
userRouter.post("/cancel-servicebookings",  authUser, cancelSeviceBooking)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyrazorpay", authUser, verifyRazorpay)


export default userRouter