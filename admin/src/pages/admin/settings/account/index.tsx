import { PasswordForm } from './password-form'
import ContentSection from '../components/content-section'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='Account Security'
      desc='Manage your password and keep your account secure.'
    >
      <PasswordForm />
    </ContentSection>
  )
}
