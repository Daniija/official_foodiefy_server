require('dotenv').config()
let nodemailer = require('nodemailer');
function sendEmail(to,otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mapeter234@gmail.com',
            pass: process.env.EMAILPASSWORD
        }
    });

    let str = "your otp = ";
    let a =otp;
    str+=a;
    str += "\nOne Time Password is valid for 2mins"
    let mailOptions = {
        from: 'mapeter234@gmail.com',
        to: to,
        // cc:cc,
        subject: 'Reset Password',
        text: str,
        html:require('./otpEmailView')({otp:otp})
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = sendEmail