import axios from 'axios'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: TWILIO_PHONE_NUMBER || '',
        To: to,
        Body: message
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID || '',
          password: TWILIO_AUTH_TOKEN || ''
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )
    
    return { success: true, sid: response.data.sid }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown SMS error'
    }
  }
}

export async function sendBulkSMS(
  messages: Array<{ to: string; message: string }>,
  concurrency = 5
): Promise<Array<{ success: boolean; sid?: string; error?: string; to: string }>> {
  const results: Array<{ success: boolean; sid?: string; error?: string; to: string }> = []
  
  for (let i = 0; i < messages.length; i += concurrency) {
    const batch = messages.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async ({ to, message }) => {
        const result = await sendSMS(to, message)
        return { ...result, to }
      })
    )
    results.push(...batchResults)
  }
  
  return results
}
