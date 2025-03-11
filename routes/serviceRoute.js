import express from 'express'
import { loginService, servicebookings, serviceCancel, serviceComplete, serviceDashboard, serviceList, serviceProfile, updateServiceProfile } from '../controllers/serviceController.js'
import authService from '../middleware/authService.js'

const serviceRouter = express.Router()


serviceRouter.get("/list", serviceList)
serviceRouter.post("/login-service", loginService)
serviceRouter.get("/service-bookings",authService, servicebookings)
serviceRouter.post("/complete-service",authService, serviceComplete)
serviceRouter.post("/cancel-service",authService, serviceCancel)
serviceRouter.get("/dashboard", authService, serviceDashboard)
serviceRouter.get("/profile",authService, serviceProfile)
serviceRouter.post("/update-profile",authService, updateServiceProfile)


export default serviceRouter