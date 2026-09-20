import axios from 'axios'
import { getApiKey } from '@/lib/env'

export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const accountSid = await getApiKey('twilio', 'Account SID')
    const authToken = await getApiKey('twilio', 'Auth Token')
    const phoneNumber = await getApiKey('twilio', 'Phone Number')
    
    if (!accountSid || !authToken) {
      return { success: false, error: 'Twilio credentials not configured' }
    }
    
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: phoneNumber || '',
        To: to,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
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
