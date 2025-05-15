export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using ThreadCraft, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>ThreadCraft is a tool for creating, managing, and publishing threads on X (Twitter). We provide this service subject to these Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Open Source</h2>
          <p>ThreadCraft is an open-source project available under the AGPL License. The source code is available at:</p>
          <p className="mt-2">
            <a 
              href="https://github.com/melihbirim/ThreadCraft" 
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/melihbirim/ThreadCraft
            </a>
          </p>
          <p className="mt-2">
            You are free to:
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>View and fork the source code</li>
              <li>Deploy your own instance</li>
              <li>Modify the code according to the license terms</li>
              <li>Contribute to the project</li>
            </ul>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>You are responsible for maintaining the security of your account</li>
            <li>You agree not to use the service for any illegal purposes</li>
            <li>You must comply with X's (Twitter's) terms of service</li>
            <li>You are responsible for all content you create and share</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p>The service and its original content, features, and functionality are owned by ThreadCraft and are protected by international copyright, trademark, and other intellectual property laws.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p>ThreadCraft shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p>We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the service, us, or third parties, or for any other reason.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p>For any questions about these Terms, please contact us at:</p>
          <p className="mt-2">Email: support@threadcraftx.com</p>
        </section>
      </div>
    </div>
  );
} 