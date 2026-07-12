import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - AdmitFlow",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <div className="flex items-center gap-2 text-xl font-bold mb-8">
        <GraduationCap className="h-6 w-6 text-indigo-600" />
        AdmitFlow
      </div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 12, 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <p>
          AdmitFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Registration</h3>
        <p>
          When you sign in with Google, we receive your name, email address, and Google account ID.
          We also collect your referral source if you complete onboarding.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visitor Registration</h3>
        <p>
          If you use the &quot;Stay Updated&quot; popup without signing in, we collect your name, email address,
          phone number (optional), referral source, browser user agent, and whether you are using the PWA app.
          This data is used solely to send you admission updates via email.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Data</h3>
        <p>
          We collect information about your activity on the service: colleges you favorite, notices you download,
          notifications you receive, community posts and comments you create, college suggestions you submit,
          and reviews you leave. This data is associated with your account.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
        <p>
          If you enable push notifications, we store your browser&apos;s push subscription endpoint and encryption keys
          to deliver real-time alerts. You can disable push notifications at any time in Settings.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
        <p>
          We use Vercel Analytics to collect anonymized page view statistics, referrer information, and
          performance metrics. Vercel Analytics does not use cookies and does not identify individual users.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h3>
        <p>
          When you use the AI chatbot, your messages are sent to a third-party LLM provider (OpenRouter, OpenAI,
          or Google AI) to generate responses. Chat messages should not contain personal information.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
        <p>
          We use your information to: authenticate your account, send admission update notifications,
          personalize your experience, improve our service, and communicate with you about service changes.
          We do not sell your personal data to third parties.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cookies</h2>
        <p>
          We use a single session cookie for authentication. This cookie is httpOnly, secure in production,
          and expires after 7 days. Vercel Analytics does not use cookies. No third-party tracking cookies are used.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Third-Party Services</h2>
        <p>
          We use the following third-party services:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Google OAuth</strong> — for authentication (login)</li>
          <li><strong>Brevo</strong> — for email delivery</li>
          <li><strong>Neon (AWS)</strong> — for database hosting</li>
          <li><strong>Vercel</strong> — for hosting and analytics</li>
          <li><strong>OpenRouter / OpenAI / Google AI</strong> — for AI chatbot and data verification</li>
          <li><strong>Klipy</strong> — for GIF search in community posts</li>
        </ul>
        <p>Each service provider has its own privacy policy governing data handling.</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Storage &amp; Security</h2>
        <p>
          Your data is stored securely on our servers using industry-standard encryption.
          Session tokens are JWT-signed and verified. We retain your data for as long
          as your account is active or as needed to provide our service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active. Visitor registration data
          is retained until you request deletion. You can delete your account at any time from the
          Profile page, which permanently removes all associated data.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Rights</h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Access</strong> — request a copy of your data via the &quot;Export My Data&quot; button on your Profile page</li>
          <li><strong>Correction</strong> — update your name and avatar through your Profile page</li>
          <li><strong>Deletion</strong> — delete your account and all associated data from the Profile page</li>
          <li><strong>Withdraw consent</strong> — disable email or push notifications in Settings at any time</li>
          <li><strong>Data portability</strong> — export your data in JSON format from your Profile page</li>
        </ul>
        <p>
          To exercise any of these rights, you can use the options in your Profile and Settings pages,
          or contact us at the email below.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at adityarb200789@gmail.com.
        </p>
      </div>
    </div>
  );
}
