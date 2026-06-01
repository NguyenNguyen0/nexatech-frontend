import { useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@/components/custom/button'
import { cn } from '@/lib/utils'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const routeError = useRouteError() as
    | { message?: string; stack?: string; statusText?: string; data?: unknown }
    | undefined
  const isDev = import.meta.env.DEV
  const errorMessage =
    routeError?.message
    || routeError?.statusText
    || (typeof routeError?.data === 'string' ? routeError.data : '')

  if (isDev && routeError) {
    console.error('[GeneralError] route error:', routeError)
  }

  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] font-bold leading-tight'>500</h1>
        )}
        <span className='font-medium'>Oops! Something went wrong {`:')`}</span>
        <p className='text-center text-muted-foreground'>
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {isDev && errorMessage && (
          <pre className='mt-2 max-w-3xl overflow-auto rounded border bg-muted p-3 text-left text-xs'>
            {errorMessage}
            {routeError?.stack ? `\n\n${routeError.stack}` : ''}
          </pre>
        )}
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  )
}
