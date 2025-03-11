import express from 'express'
import { addService, adminDashboard, allServices, loginAdmin, serviceBookingCancel, serviceBookingsAdmin } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import { changeAvailability } from '../controllers/serviceController.js'

const adminRouter = express.Router()

adminRouter.post("/add-service", upload.single('image'), addService)
adminRouter.post("/all-services", allServices)
adminRouter.post("/login",loginAdmin)
adminRouter.post("/change-availability", changeAvailability); 
adminRouter.get("/service-bookings", serviceBookingsAdmin)
adminRouter.post("/cancel-servicebookings", serviceBookingCancel)
adminRouter.get("/dashboard", adminDashboard)



export default adminRouter