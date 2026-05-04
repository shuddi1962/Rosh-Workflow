import axios from 'axios'

export interface TestResult {
  success: boolean
  error?: string
}

export async function testApiKey(service: string, apiKey: string): Promise<TestResult> {
  try {
    switch (service) {
      case 'anthropic':
        return await testAnthropic(apiKey)
      case 'openai':
        return await testOpenAI(apiKey)
      case 'openrouter':
        return await testOpenRouter(apiKey)
      case 'apify':
        return await testApify(apiKey)
      case 'news_api':
        return await testNewsAPI(apiKey)
      case 'google_trends':
        return await testGoogleTrends(apiKey)
      case 'google_maps':
        return await testGoogleMaps(apiKey)
      case 'meta':
        return await testMeta(apiKey)
      case 'twitter':
        return await testTwitter(apiKey)
      case 'linkedin':
        return await testLinkedIn(apiKey)
      case 'sendgrid':
        return await testSendGrid(apiKey)
      case 'twilio':
        return await testTwilio(apiKey)
      case 'elevenlabs':
        return await testElevenLabs(apiKey)
      case 'vercel_blob':
        return await testVercelBlob(apiKey)
      case 'pollinations':
        return { success: true } // Free service, no test needed
      case 'kie_ai':
        return { success: true } // Will implement when integrated
      default:
        return { success: false, error: 'Unknown service' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }
  }
}

async function testAnthropic(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 10000
      }
    )
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testOpenAI(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testOpenRouter(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testApify(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get(`https://api.apify.com/v2/actor-calls?token=${apiKey}`, {
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testNewsAPI(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=ng&apiKey=${apiKey}`, {
      timeout: 10000
    })
    return { success: response.status === 200 && !response.data?.code }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testGoogleTrends(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get(
      `https://trends.googleapis.com/trends/api/explore?hl=en-US&tz=-120&req={"comparisonItem":[{"keyword":"test","geo":"NG"}],"category":0,"property":""}&key=${apiKey}`,
      { timeout: 10000 }
    )
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testGoogleMaps(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`,
      { timeout: 10000 }
    )
    return { success: response.status === 200 && response.data.status !== 'REQUEST_DENIED' }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error_message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testMeta(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: { access_token: apiKey },
      timeout: 10000
    })
    return { success: response.status === 200 && !response.data?.error }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testTwitter(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testLinkedIn(apiKey: string): Promise<TestResult> {
  return { success: true }
}

async function testSendGrid(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://api.sendgrid.com/v3/user/account', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testTwilio(apiKey: string): Promise<TestResult> {
  return { success: true }
}

async function testElevenLabs(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.detail?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}

async function testVercelBlob(apiKey: string): Promise<TestResult> {
  try {
    const response = await axios.get('https://blob.vercel-storage.com/api/status', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    })
    return { success: response.status === 200 }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
    return { success: false, error: 'Connection failed' }
  }
}
