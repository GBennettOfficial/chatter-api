
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.chatterAuthToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`Error in protectRoute middleware: ${error}`);
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}