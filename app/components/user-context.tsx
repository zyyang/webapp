'use client'

import {
  createContext,
  useContext,
} from 'react'

export interface UserInfo {
  userid: string
  name: string
  role_list: { group_name: string, id: number, name: string }[]
}

export const UserInfoContext = createContext<UserInfo | null>(null)

export const useUserInfo = () => {
  const ctx = useContext(UserInfoContext)
  if (!ctx) { throw new Error('useUserInfo must be used inside DingTalkGuard') }
  return ctx
}
