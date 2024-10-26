const nodemailer = require('nodemailer');

// Create transporter with more detailed configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Sometimes needed for local development
        }
    });
};

const sendResetPasswordEmail = async (email, name, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: `"AgriConnect Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - AgriConnect',
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
                <p style="color: #666;">This link will expire in 24 hours.</p>
                <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    This is an automated message from AgriConnect Dashboard. Please do not reply to this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.verify();
        console.log('Transporter verified successfully');
        const info = await transporter.sendMail(mailOptions);
        console.log('Reset email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

// Add this initialization function
const initializeEmailService = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email service initialized successfully');
        return true;
    } catch (error) {
        console.error('Email service initialization failed:', error);
        return false;
    }
};

module.exports = { 
    sendResetPasswordEmail,
    initializeEmailService
};