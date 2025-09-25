import './styles/globals.css'
import './styles/markdown.scss'

import { getLocaleOnServer } from '@/i18n/server'

import DingTalkGuard from './components/dingtalk'

const LocaleLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = await getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <body className="h-full">
        <div className="overflow-x-auto">
          <div className="w-screen h-screen min-w-[300px]">
            <DingTalkGuard>
              {children}
            </DingTalkGuard>
          </div>
        </div>
      </body>
    </html>
  )
}

export default LocaleLayout
