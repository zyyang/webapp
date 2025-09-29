import axios from 'axios'
// src/app/api/login/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { setUserName } from '../utils/common'

const APP_KEY = process.env.DINGTALK_APP_KEY!
const APP_SECRET = process.env.DINGTALK_APP_SECRET!

interface DingTalkGroup {
  group_name: string
  id: string
  name: string
}

// 获取应用级 access_token
async function getAccessToken() {
  const url = 'https://oapi.dingtalk.com/gettoken'
  const params = { appkey: APP_KEY, appsecret: APP_SECRET }
  const res = await axios.get(url, { params })
  if (res.data.errcode !== 0) {
    throw new Error(`获取 access_token 失败: ${res.data.errmsg}`)
  }
  return res.data.access_token
}

// 使用新版 v2 接口获取 userid
async function getUseridByCode(accessToken: string, code: string) {
  const url = 'https://oapi.dingtalk.com/topapi/v2/user/getuserinfo'
  const res = await axios.post(url, { code }, { params: { access_token: accessToken } })
  if (res.data.errcode !== 0) {
    throw new Error(`获取 userid 失败: ${res.data.errmsg}`)
  }
  return res.data.result.userid
}

// 获取用户详情（含管理员身份）
async function getUserDetail(accessToken: string, userid: string) {
  const url = 'https://oapi.dingtalk.com/topapi/v2/user/get'
  const res = await axios.post(url, { userid }, { params: { access_token: accessToken } })
  if (res.data.errcode !== 0) {
    throw new Error(`获取用户详情失败: ${res.data.errmsg}`)
  }
  return res.data.result
}

// 主处理函数
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authCode } = body
    if (!authCode) {
      return NextResponse.json({ error: '缺少 authCode' }, { status: 400 })
    }

    const accessToken = await getAccessToken()
    const userid = await getUseridByCode(accessToken, authCode)
    const user = await getUserDetail(accessToken, userid)

    const smartReportRoles = user.role_list
      .filter((role: DingTalkGroup) => role.group_name === '智能报表角色组')
      .map((role: DingTalkGroup) => role.name)
      .join('|')

    const userNameWithRoles = smartReportRoles ? `${user.name}_${smartReportRoles}` : user.name

    return NextResponse.json({
      ok: true,
      ...(({ userid, name, role_list }) => ({ userid, name, role_list }))(user),
    } as object, {
      headers: setUserName(userNameWithRoles),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
