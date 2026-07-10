import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - AdmitFlow",
};

export default function TosPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <div className="flex items-center gap-2 text-xl font-bold mb-8">
        <GraduationCap className="h-6 w-6 text-indigo-600" />
        AdmitFlow
      </div>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 10, 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Acceptance of Terms</h2>
        <p>
          By accessing or using AdmitFlow (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Description of Service</h2>
        <p>
          AdmitFlow aggregates and displays admission information from Uttarakhand government colleges.
          We strive to provide accurate information but do not guarantee completeness or timeliness
          of third-party content.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials.
          You must notify us immediately of any unauthorized use of your account.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Acceptable Use</h2>
        <p>
          You agree not to misuse the Service for any unlawful purpose or in violation of any
          applicable laws. You may not attempt to access areas of the Service without authorization.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by AdmitFlow
          and are protected by applicable copyright and intellectual property laws.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Limitation of Liability</h2>
        <p>
          AdmitFlow shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages resulting from your use of the Service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be posted on this page.
          Continued use of the Service after changes constitutes acceptance of the new terms.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
        <p>
          For questions about these Terms, contact us at adityarb200789@gmail.com.
        </p>
      </div>
    </div>
  );
}
