import mongoose from "mongoose";



const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    avatar: { type: String, default: "https://vk.com/images/camera_100.png" },
    posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    backround: { type: String }

}, { timestamps: true })


export const User = mongoose.model("User", UserSchema)