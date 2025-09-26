import { ChatClient } from 'dify-client'
import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'

import {
  API_KEY,
  API_URL,
  APP_ID,
  APP_INFO,
} from '@/config'

// const userPrefix = `user_${APP_ID}:`

export const getInfo = (request: NextRequest) => {
  const sessionId = request.cookies.get('session_id')?.value || v4()
  const userName = decodeURIComponent(request.cookies.get('user_name')?.value || APP_ID)

  console.log('getInfo', sessionId, userName)
  const user = `user_${userName}:${sessionId}`
  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  if (APP_INFO.disable_session_same_site)
  { return { 'Set-Cookie': `session_id=${sessionId}; SameSite=None; Secure` } }

  return { 'Set-Cookie': `session_id=${sessionId}` }
}

export const setUserName = (userName: string) => {
  if (APP_INFO.disable_session_same_site)
  { return { 'Set-Cookie': `user_name=${encodeURIComponent(userName)}; SameSite=None; Secure` } }

  return { 'Set-Cookie': `user_name=${encodeURIComponent(userName)}` }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
