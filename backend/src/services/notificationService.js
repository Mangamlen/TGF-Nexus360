import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  } catch (err) {
    console.error("Email error", err);
  }
};

export const sendWhatsApp = async (toNumber, message) => {
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toNumber,
      body: message
    });
  } catch (err) {
    console.error("WhatsApp error", err);
  }
};
