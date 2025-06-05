
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body; // in index.js make sure to call app.use(express.json()) to parse JSON body
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const user = await User.findOne({email: email});
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10); // hash password
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })
        if (newUser) {
          generateToken(newUser._id, res);
          await newUser.save();
          res.status(201).json({ message: "User created successfully", user: { 
            id: newUser._id, email: newUser.email, fullName: newUser.fullName, profilePic: newUser.profilePic 
        } 
        });
        }
        else {
            res.status(400).json({ message: "Invalid user data"})
        }
    } catch (error) {
        console.log(`Error in signup controller:", ${error}`);
        res.status(500).json({ message: "Internal server error" });
    };
}

export const login = (req, res) => {
    res.send("login route");
}

export const logout = (req, res) => {
    res.send("logout route");
}

