import { User } from "../../models/User.js"
import { checkAuth } from "../../utils/checkAuth.js"
import cloudinary from "../../utils/cloudinary.js"
import { GraphQLUpload } from "graphql-upload"


export const uploadResolvers = {
    Upload: GraphQLUpload,

    Mutation: {

        async uploadAvatar(_, { file }, context) {
            try {
                const authUser = await checkAuth(context)

                const uploadStream = cloudinary.v2.uploader.upload_stream({ folder: "gql" },
                    async (err, result) => {
                        if (err || !result) throw new Error('Upload error ', err)

                        const user = await User.findByIdAndUpdate(authUser.id, {
                            $set: { avatar: result.secure_url }
                        })
                        if (!user) throw new Error("User not found")
                    })

                const { file: { createReadStream } } = await file;
                await createReadStream().pipe(uploadStream)

                return true;

            } catch (err) {
                throw new Error(err)
            }
        },


        async uploadBackground(_, { file }, context) {
            try {
                const authUser = await checkAuth(context)

                const uploadStream = cloudinary.v2.uploader.upload_stream({ folder: "gql" },
                    async (err, result) => {
                        if (err || !result) throw new Error(err, "Upload error")

                        const user = await User.findByIdAndUpdate(authUser.id, {
                            $set: { background: result.secure_url }
                        })
                        if (!user) throw new Error("User not found")
                    })

                const { file: { createReadStream } } = await file;
                await createReadStream().pipe(uploadStream)
                return true

            } catch (err) {
                throw new Error(err)
            }
        }

    }
}