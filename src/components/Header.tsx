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

          {/* GitHub Link */}
          <a
            href="https://github.com/melihbirim/ThreadCraft"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            title="View on GitHub"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden md:inline">Open Source</span>
          </a>

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