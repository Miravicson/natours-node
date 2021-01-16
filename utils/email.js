const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Victor Ughonu <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sengrid
      return nodemailer.createTransport({
        host: process.env.MAILGUN_HOSTNAME,
        port: process.env.MAILGUN_PORT,
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // Send the actual email
    // 1) Render Html based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

// const sendEmail = async (options) => {
//   // 1) Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   service: 'Gmail',
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAMME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   //   // Activate in gmail "less secure app" option
//   // });

//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Victor Ughonu <victorughonu95@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: `<p>${options.message}</p>`,
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };
