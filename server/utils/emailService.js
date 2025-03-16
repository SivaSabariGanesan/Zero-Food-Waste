import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Send verification email to admin
export const sendVerificationEmail = async (user) => {
  try {
    // Skip sending email in development mode
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('Email sending skipped in development mode');
      return;
    }

    // Get admin emails
    const adminEmails = process.env.ADMIN_EMAILS 
      ? process.env.ADMIN_EMAILS.split(',') 
      : ['admin@foodshare.com'];

    const mailOptions = {
      from: `"FoodShare" <${process.env.EMAIL_USER || 'noreply@foodshare.com'}>`,
      to: adminEmails.join(','),
      subject: `New User Registration: ${user.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">New User Registration</h2>
          <p>A new user has registered and is awaiting verification:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Address:</strong> ${user.address}</p>
            ${user.description ? `<p><strong>Description:</strong> ${user.description}</p>` : ''}
          </div>
          
          <p>Please log in to the admin dashboard to review and verify this user.</p>
          
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/verify-users" 
             style="display: inline-block; background-color: #2e7d32; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-top: 15px;">
            Go to Verification Dashboard
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to admin for user: ${user.email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Send notification email to user
export const sendNotificationEmail = async (recipient, subject, message) => {
  try {
    // Skip sending email in development mode
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('Email sending skipped in development mode');
      return;
    }

    const mailOptions = {
      from: `"FoodShare" <${process.env.EMAIL_USER || 'noreply@foodshare.com'}>`,
      to: recipient.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">FoodShare Notification</h2>
          <p>Hello ${recipient.name},</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>${message}</p>
          </div>
          
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">FoodShare Notification</h2>
          <p>Hello ${recipient.name},</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>${message}</p>
          </div>
          
          <p>Thank you for using FoodShare!</p>
          
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background-color: #2e7d32; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-top: 15px;">
            Go to Dashboard
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to: ${recipient.email}`);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};