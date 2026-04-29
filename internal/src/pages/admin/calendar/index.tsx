
import { Layout } from '@/components/custom/layout'
import CalendarPage from './components/calendar'

export default function Calendar() {
    return (
        <Layout fixed>
        <Layout.Body className='flex flex-col'>
          <CalendarPage />
        </Layout.Body>
      </Layout>
    )
}