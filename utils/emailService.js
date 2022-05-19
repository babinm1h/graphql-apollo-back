import nodemailer from "nodemailer"

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.mail.ru",
            port: process.env.SMTP_PORT || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER || "babinmih@mail.ru",
                pass: process.env.SMTP_PASSWORD || "mfyN6KShUxzhZ8WactZD"
            }
        })
    }



    async sendPasswordLink(to, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: "Password recover, GRAPHQL-SOCIAL",
                html: `
                <div>
                <h1>Follow this link if you want to recover password</h1
                <h3>The link is valid for 20 minutes</h3>
                <a href="${link}">Change password</a>
                </div>
                `
            })
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }
    }
}


export default new EmailService()