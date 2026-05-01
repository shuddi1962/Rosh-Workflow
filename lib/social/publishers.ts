import axios from 'axios'

export interface SocialPublishResult {
  success: boolean
  postId?: string
  url?: string
  error?: string
}

export async function publishToFacebook(
  pageId: string,
  accessToken: string,
  message: string,
  imageUrl?: string
): Promise<SocialPublishResult> {
  try {
    let mediaId: string | undefined
    
    if (imageUrl) {
      const photoRes = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        { url: imageUrl, published: false, access_token: accessToken }
      )
      mediaId = photoRes.data.id
    }
    
    const postRes = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message,
        ...(mediaId && { attached_media: [{ media_fbid: mediaId }] }),
        access_token: accessToken
      }
    )
    
    return { success: true, postId: postRes.data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Facebook error'
    }
  }
}

export async function publishToInstagram(
  instagramAccountId: string,
  accessToken: string,
  caption: string,
  imageUrl: string
): Promise<SocialPublishResult> {
  try {
    const containerRes = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: accessToken
      }
    )
    
    const containerId = containerRes.data.id
    
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    const publishRes = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken
      }
    )
    
    return { success: true, postId: publishRes.data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Instagram error'
    }
  }
}

export async function publishToLinkedIn(
  personUrn: string,
  accessToken: string,
  text: string
): Promise<SocialPublishResult> {
  try {
    await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${personUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': { visibility: 'PUBLIC' } }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    )
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown LinkedIn error'
    }
  }
}

export async function publishToTwitter(
  accessToken: string,
  accessSecret: string,
  apiKey: string,
  apiSecret: string,
  text: string
): Promise<SocialPublishResult> {
  try {
    await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Twitter error'
    }
  }
}

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
): Promise<SocialPublishResult> {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error'
    }
  }
}
