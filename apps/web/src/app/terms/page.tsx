"use client";

import LogoLink from "@/components/ui/LogoLink";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <LogoLink src="/logo.png" className="w-48 h-auto object-contain mx-auto mb-8" priority={true} />
          <h1 className="text-4xl font-serif font-bold text-ink mb-4">Terms & Conditions</h1>
          <p className="text-slate text-sm uppercase tracking-widest font-semibold">Last Updated: June 2026</p>
        </div>

        <div className="bg-surface border border-border p-8 md:p-12 shadow-sm rounded-sm prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:text-slate prose-a:text-copper hover:prose-a:text-copper-hover">
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to Corpass. These Terms & Conditions ("Terms") govern your access to and use of the Corpass B2B marketplace platform ("Platform"). By registering an account, accessing, or using the Platform, you agree to be bound by these Terms.
          </p>

          <h2>2. Role of the Marketplace</h2>
          <p>
            Corpass operates solely as a facilitator and intermediary platform connecting business buyers ("Buyers") with verified sellers ("Sellers"). Corpass is <strong>not a party to the transactions or contracts</strong> formed between Buyers and Sellers. We do not manufacture, store, inspect, or take possession of any goods listed on the Platform.
          </p>

          <h2>3. Account Eligibility & Registration</h2>
          <p>
            The Platform is strictly for Business-to-Business (B2B) use. By creating an account, you represent and warrant that you are registering on behalf of a valid, registered legal business entity and have the authority to bind that entity to these Terms.
          </p>
          <ul>
            <li>You must provide accurate and current information during registration.</li>
            <li>Sellers must provide valid tax identification numbers (e.g., GSTIN).</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          </ul>

          <h2>4. Transactions, Orders, & Inquiries</h2>
          <p>
            The Platform allows Buyers to request quotes, submit inquiries, and place orders. Contract formation occurs directly between the Buyer and the Seller once an order is confirmed or a quote is accepted.
          </p>
          <ul>
            <li>Sellers are solely responsible for setting prices, fulfilling orders, shipping, and resolving delivery issues.</li>
            <li>Buyers are solely responsible for timely payments as agreed upon with the Seller.</li>
          </ul>

          <h2>5. Asset Management Integration</h2>
          <p>
            Corpass provides an integrated Asset Management tool. Users are responsible for the accuracy of condition tracking and status updates entered into the system.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on the Platform, including but not limited to the Corpass logo, design, text, and software, is the property of Corpass or its licensors. You retain ownership of any product listings or corporate data you upload, but grant Corpass a license to display and process this data for the purpose of operating the Platform.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. Corpass makes no warranties, express or implied, regarding the reliability, accuracy, or quality of the Platform or any products listed by Sellers.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Corpass shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Platform or from the transactions formed between Buyers and Sellers.
          </p>

          <h2>9. Dispute Resolution</h2>
          <p>
            Any disputes arising between a Buyer and a Seller must be resolved directly between the parties. Corpass reserves the right, but has no obligation, to mediate disputes.
          </p>

          <h2>10. Modifications & Termination</h2>
          <p>
            Corpass reserves the right to modify these Terms at any time. We may suspend or terminate your access to the Platform immediately if you breach these Terms or engage in fraudulent activity.
          </p>

        </div>
        
        <div className="mt-12 text-center">
          <a href="/login" className="text-sm font-medium text-copper hover:text-ink transition-colors">
            &larr; Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
