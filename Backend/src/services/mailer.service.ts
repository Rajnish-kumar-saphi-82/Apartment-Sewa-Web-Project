import nodemailer from "nodemailer";

class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isDev = process.env.NODE_ENV !== "production";

  constructor() {
    this.init();
  }

  private async init() {
    if (process.env.NODE_ENV === "test") {
      
      return;
    }
    if (this.isDev) {
      try {
       
        const testAccount = await nodemailer.createTestAccount();

        
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, 
          auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
          },
        });
        
      } catch (error) {
        console.error("[Mailer] Failed to initialize ethereal mail", error);
      }
    } else {
      
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendVerificationEmail(to: string, verificationToken: string, name: string) {
    if (!this.transporter) {
      if (process.env.NODE_ENV === "test") {
        return;
      }
      console.warn("[Mailer] Transporter not initialized, skipping email sending.");
      return;
    }

    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

    const info = await this.transporter.sendMail({
      from: '"Apartment Sewa" <noreply@apartmentsewa.com>', 
      to, 
      subject: "Verify Your Email Address - Apartment Sewa", 
      text: `Hello ${name},\n\nPlease verify your email by clicking the following link:\n${verificationLink}`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Apartment Sewa, ${name}!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationLink}</p>
        </div>
      `, 
    });

    if (this.isDev) {
      console.log(`[Mailer] Verification email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[Mailer] Verification email sent to ${to}. MessageId: ${info.messageId}`);
    }
  }
}

export const mailerService = new MailerService();
