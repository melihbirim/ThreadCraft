# ThreadCraft

A free, open-source tool for writing, scheduling, and analyzing X posts, deployable on Cloudflare.

## Features

- **Write Posts**: Compose and edit your X posts with our intuitive editor. In-Progress
- **Schedule Posts**: Plan and schedule your posts for optimal engagement. Planned
- **Analyze Performance**: Track and analyze your post performance metrics. Planned

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/threadcraft.git
   cd threadcraft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Required for NextAuth.js
   NEXTAUTH_SECRET=your_generated_secret # Generate with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000 # In development

   # X (Twitter) OAuth 2.0 credentials
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   ```

   To get X (Twitter) credentials:
   1. Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   2. Create a new project and app
   3. Enable OAuth 2.0
   4. Add the following callback URL:
      - Development: `http://localhost:3000/api/auth/callback/twitter`
      - Production: `https://your-domain.com/api/auth/callback/twitter`
   5. Request the following scopes:
      - `tweet.read`
      - `tweet.write`
      - `users.read`
      - `offline.access`

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. In your Vercel dashboard:
   - Create a new project
   - Import your Git repository
   - Configure the build settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. Set up environment variables in Vercel:
   - Go to Settings > Environment Variables
   - Add the following variables:
     ```
     NEXTAUTH_SECRET=your_generated_secret # Generate with: openssl rand -base64 32
     TWITTER_CLIENT_ID=your_twitter_client_id
     TWITTER_CLIENT_SECRET=your_twitter_client_secret
     ```
   Note: Do NOT set NEXTAUTH_URL in Vercel as it's automatically handled

4. Update your X (Twitter) OAuth 2.0 settings:
   - Go to the X Developer Portal
   - Add your Vercel deployment URL to the callback URLs:
     `https://your-project.vercel.app/api/auth/callback/twitter`

5. Deploy your application:
   - Vercel will automatically deploy when you push changes to your main branch
   - You can also manually redeploy from the Vercel dashboard

### Other Hosting Platforms

When deploying to other platforms:

1. Set the following environment variables:
   - `NEXTAUTH_SECRET`: A secure random string (different from development)
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-domain.com)
   - `TWITTER_CLIENT_ID`: Your X (Twitter) OAuth 2.0 client ID
   - `TWITTER_CLIENT_SECRET`: Your X (Twitter) OAuth 2.0 client secret

2. Update your X (Twitter) OAuth 2.0 callback URLs to include your production domain.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- NextAuth.js

## License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details.

