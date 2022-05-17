import { AuthenticationError } from "apollo-server-errors"
import { Post } from "../../models/Post.js"
import { checkAuth } from "../../utils/checkAuth.js"
import { PubSub } from "graphql-subscriptions"
import { User } from "../../models/User.js"
import { Comment } from "../../models/Comment.js"


const pubsub = new PubSub()

export const postResolvers = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 }).populate("user comments")
                return posts
            } catch (err) {
                throw new Error(err)
            }
        },

        async getPost(_, { postId }) {
            try {
                let post = await Post.findById(postId).populate("comments user").sort({ createdAt: 1 })
                post = await Comment.populate(post, { path: "comments.user" })
                if (!post) throw new Error("Post not found")

                return post

            } catch (err) {
                throw new Error(err)
            }
        }
    },



    Mutation: {
        async createPost(_, { body }, context) {
            try {
                const user = await checkAuth(context)
                if (!user) throw new Error("User context not found")

                const post = await Post.create({ body, user: user.id })
                await post.populate("user")

                await User.findByIdAndUpdate(user.id, { $push: { posts: post._id } })

                pubsub.publish('NEW_POST', {
                    newPost: post
                });

                return post

            } catch (err) {
                throw new Error(err)
            }
        },


        async deletePost(_, { postId }, context) {
            try {
                const user = await checkAuth(context)

                const post = await Post.findById(postId).populate('user')
                if (!post) throw new Error("Post not found")

                if (user.id === post.user.id) {
                    await Post.findByIdAndDelete(postId)
                    await User.findByIdAndUpdate(user.id, { $pull: { posts: post._id } })
                    return post.id
                }

                throw new AuthenticationError("Action is not allowed")

            } catch (err) {
                throw new Error(err)
            }
        }
    },


    Subscription: {
        newPost: {
            subscribe: () => pubsub.asyncIterator('NEW_POST')
        }
    }
}