
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    try {

        // Deconstruct request body
        const { fullName, email, password } = req.body; // in index.js make sure to call app.use(express.json()) to parse JSON body
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Full name, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10); // hash password
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })
        if (newUser) {

            // Sign token
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                message: "User created successfully", user: {
                    id: newUser._id, email: newUser.email, fullName: newUser.fullName, profilePic: newUser.profilePic
                }
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (error) {
        if (process.env.NODE_ENV == 'development') {
            console.log(`Error in signup controller:", ${error}`);
        }
        res.status(500).json({ message: "Internal server error" });
    };
}

export const login = async (req, res) => {

    try {
        // Deconstruct request body
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Get user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Sign token
        generateToken(user._id, res);

        res.status(200).json({
            message: "Login successful", user: {
                id: user._id, email: user.email, fullName: user.fullName, profilePic: user.profilePic
            }
        });
    }
    catch (error) {
                if (process.env.NODE_ENV == 'development') {
            console.log(`Error in login controller:", ${error}`);
        }
        res.status(500).json({ message: "Internal server error" });
    }
    
}

export const logout = (req, res) => {
    res.send("logout route");
}

