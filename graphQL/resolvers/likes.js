import { Post } from "../../models/Post.js"
import { User } from "../../models/User.js"
import { checkAuth } from "../../utils/checkAuth.js"



export const likesResolver = {

    Query: {

    },


    Mutation: {
        async likePost(_, { postId }, context) {
            try {
                const user = await checkAuth(context)

                const post = await Post.findById(postId)
                const authUser = await User.findById(user.id)

                if (!post.likes.includes(authUser._id)) {
                    post.likes.push(authUser._id)
                    post.likesCount += 1
                    await post.save()

                    authUser.likes.push(postId)
                    await authUser.save()

                    await post.populate('comments user')
                    return post
                }
                else {
                    throw new Error('Already liked')
                }

            } catch (err) {
                throw new Error(err)
            }
        },


        async unlikePost(_, { postId }, context) {
            try {
                const user = await checkAuth(context)

                const post = await Post.findById(postId)
                const authUser = await User.findById(user.id)

                if (post.likes.includes(authUser._id)) {
                    post.likes = post.likes.filter(id => id.toString() !== authUser._id.toString())
                    post.likesCount -= 1
                    await post.save()


                    authUser.likes = authUser.likes.filter(id => id.toString() !== postId.toString())
                    await authUser.save()

                    await post.populate("user comments")
                    return post
                }
                else {
                    throw new Error('Not liked')
                }

            } catch (err) {
                throw new Error(err)
            }
        }
    }

}