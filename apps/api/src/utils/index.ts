import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API!);

export const sendEmail = async (email: string, jwtToken: string) => {
  return await resend.emails.send({
    from: 'Login <message@message.jasscodes.in>',
    to: [`${email}`],
    subject: 'Please login to iMex',
    html: `<h1>Here is your login magic link</h1>
    <a href="${process.env.API_BASE_URL}/auth/signin/verify?token=${jwtToken}">click here</a>`,
  });
};
