import mongoose from "mongoose";



const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    likesCount: { type: Number, min: 0, default: 0 },
    commentsCount: { type: Number, min: 0, default: 0 }

}, { timestamps: true })


export const Post = mongoose.model("Post", PostSchema)