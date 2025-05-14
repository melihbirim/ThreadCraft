import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { data: session, status } = useSession()

  const handleXAuth = async () => {
    try {
      if (session) {
        await signOut({ 
          callbackUrl: '/',
          redirect: true
        })
      } else {
        await signIn('twitter')
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <img src="/threadcraft-logo.png" alt="ThreadCraft Logo" className="w-8 h-8 rounded-full bg-gray-200" /> 
        ThreadCraft
      </h1>
      <Button
        onClick={handleXAuth}
        className={`${
          session ? 'bg-black hover:bg-gray-900' : 'bg-black hover:bg-gray-900'
        } text-white transition flex items-center gap-2`}
      >
        {status === 'loading' ? (
          'Loading...'
        ) : session ? (
          <>
            <img src={session.user.image || ''} alt="Profile" className="w-5 h-5 rounded-full" />
            Log out
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Log in with X
          </>
        )}
      </Button>
    </div>
  )
} 