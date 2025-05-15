import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

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
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="w-full px-0">
        <div className="flex items-center h-16">
          {/* Logo and Title Section */}
          <Link href="/" className="flex items-center gap-3 pl-6">
            <img 
              src="/threadcraft-logo.png" 
              alt="ThreadCraft Logo" 
              className="w-8 h-8 rounded-full bg-gray-200" 
            />
            <div>
              <h1 className="text-xl font-bold leading-none">ThreadCraft</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Write and split your X threads with ease</p>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Auth Button */}
          <Button
            onClick={handleXAuth}
            className={`${
              session ? 'bg-black hover:bg-gray-900' : 'bg-black hover:bg-gray-900'
            } text-white transition flex items-center gap-2 mr-6`}
          >
            {status === 'loading' ? (
              'Loading...'
            ) : session ? (
              <>
                <img src={session.user.image || ''} alt="Profile" className="w-5 h-5 rounded-full" />
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Exit</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline">Log in with X</span>
                <span className="sm:hidden">Login</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
} 