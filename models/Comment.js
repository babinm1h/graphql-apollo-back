import mongoose from "mongoose";



const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    post: { type: mongoose.Types.ObjectId, ref: "Post" }

}, { timestamps: true })


export const Comment = mongoose.model("Comment", CommentSchema)