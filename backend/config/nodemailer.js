import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Use the correct host
    port: 465,
    secure: true, // Use true for port 465
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS
    }
});

export default transporter;
