import { AuthenticationError } from "apollo-server-errors";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js"
    ;

export const checkAuth = async (context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
        throw new AuthenticationError("Authorization header not found")
    }

    const token = authHeader.split(" ")[1]
    if (token) {
        try {
            const decodedUser = jwt.verify(token, process.env.JWT_SECRET)
            return decodedUser

        } catch (err) {
            throw new AuthenticationError("Invalid token!")
        }
    } else {
        throw new AuthenticationError("Auth token not found")
    }
}