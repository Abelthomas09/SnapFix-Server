import jwt from 'jsonwebtoken'

// service authentication middleware
const authService = async (req, res, next) => {
    const { stoken } = req.headers
    if (!stoken) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(stoken, process.env.JWT_SECRET)
        req.body.serId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authService;