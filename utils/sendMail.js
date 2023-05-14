import { createTransport } from "nodemailer";
import { google } from "googleapis";
import { config } from "dotenv";

config({
    path:"./config/config.env",
})

const CLIENT_ID= process.env.CLIENT_ID
const CLIENT_SECRET=process.env.CLIENT_SECRET
const REDIRECT_URI=process.env.REDIRECT_URI
const REFRESH_TOKEN=process.env.REFRESH_TOKEN

const oAuthe2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuthe2Client.setCredentials({refresh_token:REFRESH_TOKEN});
export const sendMail = async(email, subject, text)=>{
    // const transport = createTransport({
    //     host:process.env.SMTP_HOST,
    //     port:process.env.SMTP_PORT,
    //     secure: false,
    //     auth:{
    //         user:process.env.SMTP_USER,
    //         pass:process.env.SMTP_PASS,
    //     },
    //     // tls: {
    //     //     // do not fail on invalid certs
    //     //     rejectUnauthorized: false
    //     // }
    // });
    // const options = {
    //     from: process.env.SMTP_USER, // địa chỉ admin email bạn dùng để gửi
    //     to: email, // địa chỉ gửi đến
    //     subject: subject, // Tiêu đề của mail
    //     text: text // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    //   }
    //   await transport.sendMail(options)  //kieu cu ko duoc do Google da khoa, dung 0Auth2
    try {
        const accessToken = await oAuthe2Client.getAccessToken();
        const transport = createTransport({
            service:'gmail',
            auth:{
                 type:"OAuth2",
                 user:process.env.SMTP_USER,
                 pass:process.env.SMTP_PASS,
                 clientId:CLIENT_ID,
                 clientSecret:CLIENT_SECRET,
                 refreshToken:REFRESH_TOKEN,
                 accessToken:accessToken
            }
        // tls: {
        //     // do not fail on invalid certs
        //     rejectUnauthorized: false
        // }
    })
    const options = {
        from: process.env.SMTP_USER, // địa chỉ admin email bạn dùng để gửi
        to: email, // địa chỉ gửi đến
        subject, // Tiêu đề của mail
        text, // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
      let info =await transport.sendMail(options);
    } catch (error) {
        console.log("Error Send Mail: ",error);
    }
}
//sendMail("toanthiennguyet@yahoo.com","Verify","Center")