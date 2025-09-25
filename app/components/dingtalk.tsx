'use client'

import {
  useEffect,
  useState,
} from 'react'

import { isInDingTalk } from '@/utils/dingtalk'

import type {
  UserInfo,
} from './user-context'
import {
  UserInfoContext,
} from './user-context'

type Status = 'loading' | 'passed' | 'failed'

export default function DingTalkGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (!isInDingTalk()) {
      setStatus('failed')
      return
    }

    import('dingtalk-jsapi').then(async (dd) => {
    // ✅ 把回调声明为 async
      dd.ready(async () => {
        try {
          const { code } = await dd.runtime.permission.requestAuthCode({
            corpId: process.env.NEXT_PUBLIC_CORP_ID!,
          })

          const res = await fetch('/api/dingtalk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authCode: code }),
          })
          const data = await res.json()

          if (!data.ok) { throw new Error('登录失败') }

          const groupName = process.env.NEXT_PUBLIC_GROUP_NAME!
          const roleName = process.env.NEXT_PUBLIC_ROLE_NAME!

          // 角色过滤示例
          const filtered = data.role_list.filter(
            (r: { group_name: string, name: string }) =>
              r.group_name === groupName && r.name === roleName,
          )
          if (filtered.length === 0) { throw new Error('角色不符') }

          setUserInfo({ userid: data.userid, name: data.name, role_list: filtered })
          setStatus('passed')
        } catch {
          setStatus('failed')
        }
      })
    })
  }, [])

  if (status === 'loading') { return <div>正在检查权限...</div> }
  if (status === 'failed') { return <div>未通过检查</div> }

  // 把用户信息通过 context 或 prop 向下传递
  return <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>
}
