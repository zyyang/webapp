export const isInDingTalk = (): boolean => {
  if (typeof window === 'undefined') { return false }
  const win = window as unknown as {
    dd?: { env?: { platform?: string } }
  }
  if (win.dd?.env?.platform) { return win.dd.env.platform !== 'notInDingTalk' }
  return /dingtalk/i.test(navigator.userAgent)
}
