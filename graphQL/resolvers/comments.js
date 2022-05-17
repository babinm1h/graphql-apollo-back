import { Comment } from "../../models/Comment.js"
import { Post } from "../../models/Post.js"
import { User } from "../../models/User.js"
import { checkAuth } from "../../utils/checkAuth.js"


export const commentsResolvers = {
    Query: {

    },


    Mutation: {
        async createComment(_, { body, postId }, context) {
            try {
                const user = await checkAuth(context)

                const comment = await Comment.create({ post: postId, user: user.id, body })

                await User.findByIdAndUpdate(user.id, { $push: { comments: comment._id } })
                await Post.findByIdAndUpdate(postId, {
                    $push: { comments: comment._id }, $inc: { commentsCount: 1 }
                })

                await comment.populate("user post")
                return comment

            } catch (err) {
                throw new Error(err)
            }
        },


        async deleteComment(_, { commentId, postId }, context) {
            try {
                const user = await checkAuth(context)
                const comment = await Comment.findById(commentId)

                if (comment.user.toString() === user.id.toString()) {
                    await Comment.findByIdAndDelete(commentId)
                    const post = await Post.findByIdAndUpdate(postId, {
                        $pull: { comments: comment._id }, $inc: { commentsCount: -1 }
                    }, { new: true }).populate("comments user")
                    await User.findByIdAndUpdate(user.id, { $pull: { comments: comment._id } })

                    return post
                }

                throw new Error("Not allowed")

            } catch (err) {
                throw new Error(err)
            }
        }
    }
}