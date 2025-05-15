# ThreadCraft

A free, open-source tool for writing, scheduling, and analyzing X posts, deployable on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmelihbirim%2FThreadCraft&env=TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET,NEXTAUTH_SECRET&envDescription=API%20keys%20needed%20for%20ThreadCraft%20to%20work&envLink=https%3A%2F%2Fgithub.com%2Fmelihbirim%2FThreadCraft%2Fblob%2Fmain%2F.env.example&project-name=threadcraft&repository-name=threadcraft&demo-title=ThreadCraft&demo-description=An%20open-source%20tool%20for%20writing%2C%20scheduling%2C%20and%20analyzing%20X%20posts&demo-url=https%3A%2F%2Fthread-craft-nine.vercel.app&demo-image=https%3A%2F%2Fthread-craft-nine.vercel.app%2Fog-image.png)

## About

ThreadCraft is an open-source project that aims to make thread creation and management on X (formerly Twitter) easier and more efficient. The project is maintained by [Melih Birim](https://github.com/melihbirim) and is open for contributions from the community.

### Open Source

This project is completely open source and free to use. You can:
- Fork and modify the code
- Deploy your own instance
- Contribute to the project
- Report issues and suggest features

Source Code: [github.com/melihbirim/ThreadCraft](https://github.com/melihbirim/ThreadCraft)

### Quick Deploy

You can deploy your own instance of ThreadCraft with one click using Vercel:

1. Click the "Deploy with Vercel" button above
2. Set up your environment variables:
   - `TWITTER_CLIENT_ID`: Your X (Twitter) OAuth client ID
   - `TWITTER_CLIENT_SECRET`: Your X (Twitter) OAuth client secret
   - `NEXTAUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
3. Deploy and start using your own instance!

## Features

- **Write Posts**: Compose and edit your X posts with our intuitive editor. In-Progress
- **Schedule Posts**: Plan and schedule your posts for optimal engagement. Planned
- **Analyze Performance**: Track and analyze your post performance metrics. Planned
- **AI-Powered**: Generate and improve threads using XAI (Vercel AI). In-Progress

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
   3. Enable OAuth 2.0 (User Authentication)
   4. Set App Permissions to "Read and Write"
   5. Add the following callback URL:
      - Development: `http://localhost:3000/api/auth/callback/twitter`
      - Production: `https://your-domain.com/api/auth/callback/twitter`

   To get XAI access:
   1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
   2. Select your project
   3. Go to the "Settings" tab
   4. Navigate to "AI" in the sidebar
   5. Enable AI features
   6. Select "XAI" as your AI provider
   7. The API key will be automatically configured for your frontend

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

4. Update your X (Twitter) OAuth settings:
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
   - `TWITTER_CLIENT_ID`: Your X (Twitter) OAuth 1.0a client ID
   - `TWITTER_CLIENT_SECRET`: Your X (Twitter) OAuth 1.0a client secret

2. Update your X (Twitter) OAuth callback URLs to include your production domain.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- NextAuth.js

## License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details.

