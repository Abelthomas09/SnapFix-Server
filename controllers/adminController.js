
import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary";
import serviceModel from '../models/serviceModel.js';
import jwt from 'jsonwebtoken'
import serviceBookingModel from '../models/serviceBookingModel.js';
import userModel from '../models/userModel.js';



// API for adding Service
const addService = async (req, res) => {

    try {

        const { name, email, password, service, speciality, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add service
        if (!name || !email || !password ||!service || !speciality || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
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

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const serviceData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            service,
            speciality,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newService = new serviceModel(serviceData)
        await newService.save()
        res.json({ success: true, message: 'Service Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Generate JWT token with email
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all services list for admin panel
const allServices = async (req, res) => {
    try {

        const services = await serviceModel.find({}).select('-password')
        res.json({ success: true, services })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all serviceBookings list
const serviceBookingsAdmin = async (req, res) => {
    try {

        const serviceBookings = await serviceBookingModel.find({})
        res.json({ success: true, serviceBookings })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel servicebooking
const serviceBookingCancel = async (req, res) => {
    try {

        const { servicebookingId } = req.body
        const servicebookingData = await serviceBookingModel.findById(servicebookingId)

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

const adminDashboard = async (req, res) => {
    try {

        const services = await serviceModel.find({})
        const users = await userModel.find({})
        const servicesbookings = await serviceBookingModel.find({})

        const dashData = {
            servicesNum: services.length,
            servicesbookingsNum: servicesbookings.length,
            usersNum: users.length,
            latestservicesbookings: servicesbookings.reverse().slice(0,5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {addService,loginAdmin,allServices,serviceBookingsAdmin,serviceBookingCancel,adminDashboard}