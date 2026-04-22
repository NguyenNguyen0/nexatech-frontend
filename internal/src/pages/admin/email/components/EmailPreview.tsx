import React, { useMemo } from 'react'
import ReactDOMServer from 'react-dom/server'
import AppleReceiptEmail from './AppleReceiptEmail'
import GooglePlayPolicyUpdateEmail from './GooglePlayPolicyUpdateEmail'
import AWSVerifyEmail from './AWSVerifyEmail'

interface EmailPreviewProps {
  template: string
  userEmail: string
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ template, userEmail }) => {
  const getEmailComponent = (template: string, userEmail: string) => {
    switch (template) {
      case 'apple':
        return <AppleReceiptEmail userEmail={userEmail} />
      case 'google':
        return <GooglePlayPolicyUpdateEmail userEmail={userEmail} />
      case 'aws':
        return <AWSVerifyEmail userEmail={userEmail} />
      default:
        return <AppleReceiptEmail userEmail={userEmail} />
    }
  }
  const previewHtml = useMemo(() => {
    const emailElement = getEmailComponent(template, userEmail)
    return ReactDOMServer.renderToStaticMarkup(emailElement)
  }, [template, userEmail])

  return (
    <div className="rounded-lg border p-4 bg-background">
      <h2 className="mb-4 text-xl font-bold">Email Preview</h2>
      <div className="overflow-hidden rounded-md border">
        <iframe
          title="Email preview"
          srcDoc={previewHtml}
          className="h-[700px] w-full bg-white"
          sandbox=""
        />
      </div>
    </div>
  )
}

export default EmailPreview

