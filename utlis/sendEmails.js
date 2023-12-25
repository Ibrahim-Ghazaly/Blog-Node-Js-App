const nodemailer = require('nodemailer');

module.exports = async(userEmail,subject,htmlTemplate)=>{
  
    try{
        // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,           //Sender
    ssl: false,
    tls: true,
    auth: {
      user: process.env.APP_EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

    // 2) Define email options (like from, to, subject, email content)
    const mailOpts = {
        from:process.env.APP_EMAIL_ADDRESS,//SENDER
        to: userEmail,
        subject:subject,
        html:htmlTemplate
        // text: options.message,
      };
    
      // 3) Send email
      await transporter.sendMail(mailOpts);
    }catch(error){
       console.log(error)
       throw new Error('internal server error')
    }
}