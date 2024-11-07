const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendResetPasswordEmail = async (email, name, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.DASHBOARD_URL}/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: `"AgriConnect Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - AgriConnect Dashboard',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Password Reset Request</h2>
                    <p>Hello ${name},</p>
                    <p>We received a request to reset your password for your AgriConnect dashboard account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p>${resetUrl}</p>
                    <p style="color: #666;">This link will expire in 24 hours.</p>
                    <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">
                        This is an automated message from AgriConnect Dashboard. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw error;
    }
};

const sendCustomerResetEmail = async (email, name, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: `"AgriConnect Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your Password - AgriConnect',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #059473;">Reset Your Password</h2>
                    <p>Hello ${name},</p>
                    <p>We received a request to reset your password for your AgriConnect account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #059473; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p>${resetUrl}</p>
                    <p style="color: #666;">This link will expire in 24 hours.</p>
                    <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">
                        This is an automated message from AgriConnect. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw error;
    }
};

const initializeEmailService = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendCustomerResetEmail,
    initializeEmailService
};