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
      <p className="text-sm text-gray-500 mb-8">Last updated: July 10, 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <p>
          AdmitFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
        <p>
          We collect information you provide directly: name, email address, and password (stored as a secure hash).
          When you sign in with Google, we receive your name, email address, and Google account ID from Google.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
        <p>
          We use your information to provide and improve our service: authenticate your account,
          send notifications about college admission updates, and communicate with you about service changes.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Storage & Security</h2>
        <p>
          Your data is stored securely on our servers using industry-standard encryption.
          Passwords are hashed and never stored in plain text. We retain your data for as long
          as your account is active or as needed to provide our service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Third-Party Services</h2>
        <p>
          We use Google OAuth for authentication, Brevo for email delivery, and Neon for database hosting.
          Each service provider has its own privacy policy governing data handling.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Rights</h2>
        <p>
          You can request access, correction, or deletion of your personal data at any time
          by contacting us. You may also delete your account through the settings page.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at adityarb200789@gmail.com.
        </p>
      </div>
    </div>
  );
}
