import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Get SMTP configuration from environment variables
function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
}

// Create transporter
function createTransporter() {
  const config = getSmtpConfig();
  return nodemailer.createTransport(config);
}

// Send email
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  try {
    console.log('📧 [EMAIL] Starting email send process...', {
      to,
      subject,
      hasHtml: !!html,
      hasText: !!text
    });

    // Check SMTP configuration
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? '***configured***' : 'MISSING',
      pass: process.env.SMTP_PASS ? '***configured***' : 'MISSING'
    };
    console.log('📧 [EMAIL] SMTP Configuration:', smtpConfig);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP configuration is incomplete. Missing required environment variables.');
    }

    const transporter = createTransporter();
    const from = process.env.SMTP_USER || 'noreply@inspiredanalyst.com';

    console.log('📧 [EMAIL] Sending email via SMTP...', {
      from,
      to,
      subject
    });

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    });

    console.log('✅ [EMAIL] Email sent successfully!', {
      messageId: result.messageId,
      to,
      subject,
      accepted: result.accepted,
      rejected: result.rejected
    });
  } catch (error: any) {
    console.error('❌ [EMAIL] Error sending email:', {
      error: error.message,
      stack: error.stack,
      to,
      subject,
      smtpError: error.code || error.response || error.responseCode
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Email verification email
export async function sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to TechSol</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up! Please verify your email address to complete your registration.</p>
          <p style="margin-bottom: 30px;">Click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #3813F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 24 hours.</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - TechSol',
    html,
  });
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password for your TechSol account.</p>
          <p style="margin-bottom: 30px;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #3813F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - TechSol',
    html,
  });
}

// Bootcamp enrollment email - requires signup
export async function sendBootcampSignupRequiredEmail(
  email: string, 
  customerName: string, 
  bootcampTitle: string, 
  bootcampId: string
): Promise<void> {
  console.log('📧 [BOOTCAMP EMAIL] Preparing bootcamp signup required email...', {
    email,
    customerName,
    bootcampTitle,
    bootcampId
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const signupUrl = `${baseUrl}/signin`;
  
  console.log('📧 [BOOTCAMP EMAIL] Email configuration:', {
    baseUrl,
    signupUrl
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Bootcamp Enrollment</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to ${bootcampTitle}!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your payment for <strong>${bootcampTitle}</strong> has been successfully processed.</p>
          <p style="margin-bottom: 30px;">To access your bootcamp videos and materials, you'll need to create an account on our platform using the same email address you used for payment: <strong>${email}</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupUrl}" style="display: inline-block; background: #3813F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">Sign Up to Access Bootcamp</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Once you sign up and verify your email, you'll have full access to all bootcamp content, including:</p>
          <ul style="font-size: 14px; color: #666; margin-top: 15px; padding-left: 20px;">
            <li>All video lessons</li>
            <li>Course materials and resources</li>
            <li>Progress tracking</li>
            <li>Community access</li>
          </ul>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">Happy learning!<br>The TechSol Team</p>
        </div>
      </body>
    </html>
  `;

  console.log('📧 [BOOTCAMP EMAIL] Calling sendEmail function...');
  
  try {
    await sendEmail({
      to: email,
      subject: `Complete Your Enrollment - ${bootcampTitle}`,
      html,
    });
    console.log('✅ [BOOTCAMP EMAIL] Bootcamp signup required email sent successfully!', {
      email,
      bootcampTitle
    });
  } catch (error: any) {
    console.error('❌ [BOOTCAMP EMAIL] Failed to send bootcamp signup required email:', {
      error: error.message,
      email,
      bootcampTitle,
      bootcampId
    });
    throw error;
  }
}

// Bootcamp enrollment email - for existing users
export async function sendBootcampEnrollmentEmail(
  email: string,
  customerName: string,
  bootcampTitle: string,
  bootcampId: string,
  bootcampDescription?: string
): Promise<void> {
  console.log('📧 [BOOTCAMP ENROLLMENT EMAIL] Preparing bootcamp enrollment email...', {
    email,
    customerName,
    bootcampTitle,
    bootcampId
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const bootcampUrl = `${baseUrl}/bootcamp/${bootcampId}/progress`;

  console.log('📧 [BOOTCAMP ENROLLMENT EMAIL] Email configuration:', {
    baseUrl,
    bootcampUrl
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${bootcampTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to ${bootcampTitle}!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your enrollment in <strong>${bootcampTitle}</strong> has been confirmed.</p>
          <p style="margin-bottom: 30px;">You now have full access to all bootcamp content. Click the button below to start your learning journey:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${bootcampUrl}" style="display: inline-block; background: #3813F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">Access Bootcamp</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${bootcampUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">As an enrolled student, you have access to:</p>
          <ul style="font-size: 14px; color: #666; margin-top: 15px; padding-left: 20px;">
            <li>All video lessons and tutorials</li>
            <li>Course materials and resources</li>
            <li>Progress tracking and analytics</li>
            <li>Community access and support</li>
          </ul>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">Happy learning!<br>The TechSol Team</p>
        </div>
      </body>
    </html>
  `;

  console.log('📧 [BOOTCAMP ENROLLMENT EMAIL] Calling sendEmail function...');
  
  try {
    await sendEmail({
      to: email,
      subject: `Welcome to ${bootcampTitle} - TechSol`,
      html,
    });
    console.log('✅ [BOOTCAMP ENROLLMENT EMAIL] Bootcamp enrollment email sent successfully!', {
      email,
      bootcampTitle
    });
  } catch (error: any) {
    console.error('❌ [BOOTCAMP ENROLLMENT EMAIL] Failed to send bootcamp enrollment email:', {
      error: error.message,
      email,
      bootcampTitle,
      bootcampId
    });
    throw error;
  }
}

