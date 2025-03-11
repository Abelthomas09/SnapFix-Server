import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import serviceBookingModel from "../models/serviceBookingModel.js";
import serviceModel from "../models/serviceModel.js";
import razorpay from 'razorpay';


// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }  

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
 // API to get user profile data
 const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address } = req.body
        const imageFile = req.file

        if (!name || !phone) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address) })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book servicebooking 
const bookService = async (req, res) => {

    try {

        const { userId, serId, slotDate, slotTime } = req.body
        const serData = await serviceModel.findById(serId).select("-password")

        if (!serData.available) {
            return res.json({ success: false, message: 'Service Not Available' })
        }

        let slots_booked = serData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete serData.slots_booked

        const bookingData = {
            userId,
            serId,
            userData,
            serData,
            amount: serData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newService = new serviceBookingModel(bookingData)
        await newService.save()

        // save new slots data in serData
        await serviceModel.findByIdAndUpdate(serId, { slots_booked })

        res.json({ success: true, message: 'Service Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get user services for frontend my-serviceBookings page
const listService = async (req, res) => {
    try {

        const { userId } = req.body
        const serviceBookings = await serviceBookingModel.find({ userId })

        res.json({ success: true, serviceBookings })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel servicebooking
const cancelSeviceBooking = async (req, res) => {
    try {

        const { userId, servicebookingId } = req.body
        const servicebookingData = await serviceBookingModel.findById(servicebookingId)

        // verify servicebooking user 
        if (servicebookingData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await serviceBookingModel.findByIdAndUpdate(servicebookingId, { cancelled: true })

        // releasing service slot 
        const { serId, slotDate, slotTime } = servicebookingData

        const serviceData = await serviceModel.findById(serId)

        let slots_booked = serviceData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await serviceModel.findByIdAndUpdate(serId, { slots_booked })

        res.json({ success: true, message: 'SeviceBooking Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({ 
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to make payment of booking using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { servicebookingId } = req.body;
        
        if (!servicebookingId) {
            return res.json({ success: false, message: "Service booking ID is required" });
        }

        const servicebookingData = await serviceBookingModel.findById(servicebookingId);

        if (!servicebookingData) {
            return res.json({ success: false, message: "ServiceBooking not found" });
        }

        if (servicebookingData.cancelled) {
            return res.json({ success: false, message: "ServiceBooking is cancelled" });
        }

        if (!servicebookingData.amount) {
            return res.json({ success: false, message: "ServiceBooking amount is missing" });
        }

        // Creating options for Razorpay payment
        const options = {
            amount: servicebookingData.amount * 100, 
            currency: process.env.CURRENCY || "INR",
            receipt: servicebookingId,
        };

        // Create Razorpay order
        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await serviceBookingModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export {registerUser,loginUser,getProfile,updateProfile,bookService,listService,cancelSeviceBooking,paymentRazorpay,verifyRazorpay}
