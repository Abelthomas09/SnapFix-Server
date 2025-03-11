import serviceModel from "../models/serviceModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import serviceBookingModel from "../models/serviceBookingModel.js";

// API for service Login 
const loginService = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await serviceModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get  servicebookings for service panel
const servicebookings = async (req, res) => {
    try {

        const { serId } = req.body
        const servicebookings = await serviceBookingModel.find({ serId })

        res.json({ success: true, servicebookings })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark service completed for service panel
const serviceComplete = async (req, res) => {
    try {

        const { serId, servicebookingId } = req.body

        const servicebookingData = await serviceBookingModel.findById(servicebookingId)
        if (servicebookingData && servicebookingData.serId === serId) {
            await serviceBookingModel.findByIdAndUpdate(servicebookingId, { isCompleted: true })
            return res.json({ success: true, message: 'Service Completed' })
        }

        res.json({ success: false, message: 'Completion Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel service for service panel
const serviceCancel = async (req, res) => {
    try {

        const { serId, servicebookingId } = req.body

        const servicebookingData = await serviceBookingModel.findById(servicebookingId)
        if (servicebookingData && servicebookingData.serId === serId) {
            await serviceBookingModel.findByIdAndUpdate(servicebookingId, { cancelled: true })
            return res.json({ success: true, message: 'Service Cancelled' })
        }

        res.json({ success: false, message: 'Service Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to change service availablity for Admin and Service Panel
const changeAvailability = async (req, res) => {
    try {
        
        const { serId } = req.body;
        const serData = await serviceModel.findById(serId);
        await serviceModel.findByIdAndUpdate(serId, { available: !serData.available });
        res.json({ success: true, message: "Availability Changed" });

    } catch (error) {
        console.error("Error in changeAvailability:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get dashboard data for service panel
const serviceDashboard = async (req, res) => {
    try {

        const { serId } = req.body

        const servicebookings = await serviceBookingModel.find({ serId })

        let earnings = 0

        servicebookings.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let users = []

        servicebookings.map((item) => {
            if (!users.includes(item.userId)) {
                users.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            servicebookings: servicebookings.length,
            users: users.length,
            latestServiceBookings: servicebookings.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all services list for Frontend
const serviceList = async (req, res) => {
    try {

        const services = await serviceModel.find({}).select(['-password', '-email'])
        res.json({ success: true, services })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get service profile for  Service Panel
const serviceProfile = async (req, res) => {
    try {

        const { serId } = req.body
        const profileData = await serviceModel.findById(serId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update service profile data from  Service Panel
const updateServiceProfile = async (req, res) => {
    try {    

        const { serId, fees, address, about, available } = req.body

        await serviceModel.findByIdAndUpdate(serId, { fees, address, available, about })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { changeAvailability,serviceList,loginService,servicebookings,serviceComplete,serviceCancel,serviceDashboard,serviceProfile,updateServiceProfile };
