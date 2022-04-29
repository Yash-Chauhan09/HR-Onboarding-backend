const dotenv =require( "dotenv");
dotenv.config({ path: "./config/config.env" });

const nodemailer =require("nodemailer");

async function sendMail(data) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "pooransingh1392@gmail.com",
      pass: "kacntlnzrokurrpd",
    },
  });

  let info = await transporter.sendMail({
    from: '"pooran Singh " <pooransingh1392@gmail.com>', // sender address
    to: data.email, // list of receivers
    subject: "Welcome!", // Subject line
    text: "Reset your password to get started!", // plain text body
    html: `
    <h1>click on the below link to reset your password</h1>
    <h3>email : ${data.email}</h3>
    <h3>password : ${data.password}</h3>
    <h3>Sign-in here: https://hr-onboarding.com/</h3>
    `, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports=sendMail