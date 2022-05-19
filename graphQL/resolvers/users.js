import { AuthenticationError, ForbiddenError, UserInputError } from "apollo-server-errors"
import bcrypt from "bcryptjs"
import { Post } from "../../models/Post.js"
import { User } from "../../models/User.js"
import { checkAuth } from "../../utils/checkAuth.js"
import { generateToken } from "../../utils/generateToken.js"
import jwt from "jsonwebtoken"
import emailService from "../../utils/emailService.js"

export const usersResolvers = {
    Query: {
        async getUser(_, { userId }, context) {
            try {
                let user = await User.findById(userId).populate("posts")
                user = await Post.populate(user, { path: "posts.user" })

                if (!user) throw new Error("User not found")

                return user

            } catch (err) {
                throw new Error(err)
            }
        }
    },


    Mutation: {
        async register(_, { input }, сontext, info) {
            try {
                const { email, password, confirmPassword, username } = input;

                if (password !== confirmPassword) {
                    throw new UserInputError("Passwords dont match")
                }

                const candidate = await User.findOne({
                    $or: [
                        { email: email },
                        { username: username }
                    ]
                })

                if (candidate) {
                    throw new UserInputError("This email or username already in use")
                }

                const hashedPassword = await bcrypt.hash(password, 6)
                const user = await User.create({ email, username, password: hashedPassword })
                const token = generateToken(user._id, email, username)

                return { ...user.toJSON(), token, id: user._id }

            } catch (err) {
                throw new Error(err)
            }
        },



        async login(_, { email, password }, context, info) {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new UserInputError("User not found")
                }

                const comparedPassword = await bcrypt.compare(password, user.password)
                if (!comparedPassword) {
                    throw new UserInputError("Wrong password")
                }

                const token = generateToken(user._id, user.email, user.username)
                return { ...user.toJSON(), token, id: user._id }

            } catch (err) {
                throw new Error(err)
            }
        },


        async getAuth(_, __, context) {
            try {
                const me = await checkAuth(context)
                if (!me) throw new AuthenticationError("Not authorized")

                const user = await User.findById(me.id).populate("comments")
                if (!user) throw new AuthenticationError("Not authorized")

                return { ...user.toJSON(), id: user._id }


            } catch (err) {
                throw new Error(err)
            }
        },


        async sendLink(_, { email }, context) {
            try {
                const user = await User.findOne({ email })
                if (!user) throw new ForbiddenError("User with this email not found")

                const secretLink = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '20m' })
                await emailService.sendPasswordLink(email, `http://localhost:3000/password/${secretLink}`)

                return "Follow the link sent to your email"

            } catch (err) {
                throw new Error(err)
            }
        },


        async changePassword(_, { secretLink, password }) {
            try {
                const { email } = jwt.verify(secretLink, process.env.JWT_SECRET)
                if (!email) if (!email) return ForbiddenError("Invalid secret link")

                const hashedPassword = await bcrypt.hash(password, 6)
                const user = await User.findOneAndUpdate({ email }, { password: hashedPassword })
                if (!user) return ForbiddenError("User not found")

                return "Password changed successfully"

            } catch (err) {
                throw new Error(err)
            }
        }
    }
}