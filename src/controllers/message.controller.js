
import User from "../models/user.model.js";
import Message  from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        if (process.env.NODE_ENV == 'development') {
            console.error("Error fetching users for sidebar:", error);
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:friendId } = req.params;
        const userId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId: friendId },
                { senderId: friendId, recipientId: userId }
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        if (process.env.NODE_ENV == 'development') {
            console.error("Error fetching messages:", error);
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const {id: recipientId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recipientId,
            text,
            image: imageUrl
        })

        await newMessage.save();

        // todo: realtime functionality using socket.io
        
        res.status(201).json(newMessage);
    } catch (error) {
        if (process.env.NODE_ENV == 'development') {
            console.error("Error sending message:", error);
        }
        res.status(500).json({ message: "Internal server error" });
    }
}