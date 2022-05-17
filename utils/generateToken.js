import jwt from "jsonwebtoken"


export const generateToken = (id, email, username) => {
    return jwt.sign({ id, email, username }, process.env.JWT_SECRET, { expiresIn: "30d" })
}