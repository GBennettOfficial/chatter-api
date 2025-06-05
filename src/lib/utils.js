
import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: 15 * 60,
    })

    res.cookie("jwt", token, { 
        maxAge: 15 * 60 * 1000, 
        httpOnly: true, // inhibits XSS attacks (cross-site scripting)
        sameSite: "strict", // inhibits CSRF attacks (cross-site request forgery)
        secure: process.env.NODE_ENV !== 'development' // enforces https in production
    });

    return token;
}