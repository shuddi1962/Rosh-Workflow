import nodemailer from 'nodemailer'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: SENDGRID_API_KEY
      }
    })
    
    const mailOptions = {
      from: options.from || 'Roshanal Infotech <info@roshanalinfotech.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments
    }
    
    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

export async function sendBulkEmails(
  emails: EmailOptions[],
  concurrency = 5
): Promise<Array<{ success: boolean; messageId?: string; error?: string; to: string }>> {
  const results: Array<{ success: boolean; messageId?: string; error?: string; to: string }> = []
  
  for (let i = 0; i < emails.length; i += concurrency) {
    const batch = emails.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (email) => {
        const result = await sendEmail(email)
        return { ...result, to: email.to }
      })
    )
    results.push(...batchResults)
  }
  
  return results
}
