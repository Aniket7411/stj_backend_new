// emailService.js

const nodemailer = require("nodemailer");

/**
 * Sends an email using Nodemailer.
 * @param {string} email - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} htmlContent - HTML content of the email.
 */
const emailVerification = async (email, subject, htmlContent) => {
    try {
        console.log("13")
        // const transporter = nodemailer.createTransport({
        //     service: "Gmail",  // Use your email service provider
        //     auth: {
        //         user: 'pankajsoni93444@gmail.com', // Your Gmail account
        //         pass: 'crqd ypbg ybyw vzfs' // Your Gmail password
        //     },
        // });

         const transporter = nodemailer.createTransport(
                {
                   host: 'smtp.hostinger.com',
                  // host: 'smtp.ethereal.email',
                  port: 587,
                  secure: false, // true for port 465, false for other ports
                  auth: {
                    user: 'admin@securethatjob.com',
                    pass: 'Secure@8303', // email password
                  },
                },
                {
                  tls: {
                    rejectUnauthorized: false,
                    timeout: 1500,
                    // secureOptions: number | undefined;
                    // secureProtocol: string | undefined;
                  },
                }
              );
        console.log("20")
        const mailOptions = {
            from: 'admin@securethatjob.com',
            to: email,
            subject,
            html: htmlContent,
        };
        console.log("27")
       let data= await transporter.sendMail(mailOptions);
        console.log(data,"Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error,"........................................................................");
        throw new Error("Email sending failed");
    }
};

module.exports =  emailVerification;
