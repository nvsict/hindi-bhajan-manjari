import { 
  FaShieldAlt, 
  FaUserSecret, 
  FaCookieBite, 
  FaExternalLinkAlt,
  FaAd, 
  FaGavel, 
  FaUserShield, 
  FaFileContract, 
  FaDatabase
} from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'Privacy Policy | Hindi Bhajan Manjari',
  description:
    'Learn how Hindi Bhajan Manjari collects, uses, protects, and handles information, including cookies, submissions, contact information, advertising, and third-party services.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/privacy',
  }
};

export default function PrivacyPolicy() {
  const lastUpdated = "September 13, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <article className="max-w-5xl mx-auto bg-white shadow-xl shadow-gray-900/5 border border-orange-100 rounded-[2.5rem] overflow-hidden">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <FaShieldAlt className="text-5xl mx-auto mb-6 opacity-90 drop-shadow-md" />

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">
              Privacy Policy
            </h1>

            <p className="text-orange-50 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              This Privacy Policy explains how Hindi Bhajan Manjari collects,
              uses, stores, and protects information when you use our website
              and related features.
            </p>

            <div className="mt-8 inline-block bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>
          
          {/* Decorative Pattern */}
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
              backgroundSize: '30px 30px' 
            }}
          ></div>
        </div>

        <div className="p-8 md:p-16">
          <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed text-[17px]">
            
            {/* --- INTRODUCTION --- */}
            <section className="mb-12">
              <p className="text-gray-800 font-bold text-xl mb-6 border-l-4 border-orange-500 pl-4 bg-orange-50 p-5 rounded-r-xl">
                Hindi Bhajan Manjari is committed to respecting the privacy of
                visitors, contributors, and other users of the website. This
                Privacy Policy explains what information may be collected,
                why it may be collected, how it may be used, and the choices
                available to you.
              </p>

              <p className="mb-4">
                This policy applies to the website operated at
                <strong> hindibhajanmanjari.com</strong>, including its
                devotional content, contact and submission features, newsletter
                signup, optional contribution features, and other services
                made available through the website.
              </p>

              <p>
                This Privacy Policy should be read together with our{' '}
                <Link
                  href="/terms"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/dmca"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Copyright / DMCA Policy
                </Link>.
              </p>
            </section>

            <hr className="my-10 border-gray-100" />

            {/* --- SECTION 1 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaDatabase size={22} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  1. Information We May Collect
                </h2>
              </div>

              <p className="mb-5">
                The information we collect depends on how you interact with
                Hindi Bhajan Manjari. We try to collect only information that
                is relevant to providing, maintaining, improving, or securing
                the website and its features.
              </p>

              <ul className="list-disc pl-6 space-y-4 marker:text-orange-500">
                <li>
                  <strong>Contact information:</strong> If you contact us,
                  we may receive your name, email address, phone number,
                  WhatsApp number, message, attachments, or other information
                  that you voluntarily provide.
                </li>

                <li>
                  <strong>Bhajan submissions:</strong> If you submit a Bhajan,
                  Aarti, Chalisa, Stotram, or other devotional material through
                  our submission form, we may collect the title, lyrics or
                  text, optional contributor name, optional melody/tune
                  information, and optional contact information.
                </li>

                <li>
                  <strong>Publication-related information:</strong> Information
                  supplied with a submission may be used to review, verify,
                  edit, attribute, communicate about, or potentially publish
                  the submission. Submission does not guarantee publication.
                </li>

                <li>
                  <strong>Newsletter information:</strong> If you voluntarily
                  subscribe to our email updates, we may collect the email
                  address you provide so that we can send the requested
                  communications.
                </li>

                <li>
                  <strong>Donation or contribution information:</strong> If you
                  voluntarily support the website through a payment provider,
                  payment processing information may be handled by the relevant
                  payment service provider. We do not need to receive or store
                  your complete card or banking credentials ourselves in order
                  for the payment to be processed.
                </li>

                <li>
                  <strong>Technical and usage information:</strong> Depending
                  on the services and technologies active on the website, we
                  or our service providers may receive information such as
                  IP address, browser type, device information, referring
                  pages, approximate usage information, timestamps, and
                  interactions with the website.
                </li>

                <li>
                  <strong>Cookies and similar technologies:</strong> Cookies,
                  local storage, pixels, or similar technologies may be used
                  for essential website functionality, preferences,
                  measurement, security, and, where applicable, advertising.
                </li>
              </ul>
            </section>

            {/* --- SECTION 2 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaUserSecret size={22} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  2. How We Use Information
                </h2>
              </div>

              <p className="mb-4">
                Information may be used for purposes such as:
              </p>

              <ul className="list-disc pl-6 space-y-3 marker:text-orange-500">
                <li>
                  Operating, maintaining, and securing Hindi Bhajan Manjari.
                </li>

                <li>
                  Responding to questions, feedback, corrections, copyright
                  concerns, and other contact requests.
                </li>

                <li>
                  Reviewing and processing user-submitted devotional content.
                </li>

                <li>
                  Contacting a contributor when they voluntarily provide
                  contact information for submission-related communication.
                </li>

                <li>
                  Publishing appropriate contributor attribution when a
                  contributor chooses to provide a name and the submission is
                  accepted for publication.
                </li>

                <li>
                  Sending newsletter or website updates when a visitor has
                  voluntarily subscribed to receive them.
                </li>

                <li>
                  Understanding website usage and improving content,
                  navigation, accessibility, features, and performance.
                </li>

                <li>
                  Protecting the website against abuse, spam, fraud, security
                  incidents, and unauthorized activity.
                </li>

                <li>
                  Processing voluntary contributions through the relevant
                  payment provider.
                </li>

                <li>
                  Complying with applicable legal obligations and responding
                  to valid legal requests.
                </li>
              </ul>

              <p className="mt-5">
                We do not use contact information submitted through the Bhajan
                submission form as a general marketing list merely because a
                person provided it for submission-related communication.
              </p>
            </section>

            {/* --- SECTION 3 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200">
                  <FaAd size={22} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  3. Advertising and Google AdSense
                </h2>
              </div>

              <div className="bg-orange-50/60 border border-orange-200 p-8 rounded-[2rem] shadow-inner">
                <p className="mb-4 text-gray-800">
                  Hindi Bhajan Manjari may use advertising services such as
                  Google AdSense. Advertising availability may change over
                  time, and advertising services are not necessarily active
                  on every page or for every visitor.
                </p>

                <p className="mb-4">
                  If Google or another advertising provider serves
                  advertisements on the website, third-party vendors,
                  including Google, may use cookies or similar technologies
                  to serve, measure, personalize, or otherwise support
                  advertising, subject to the applicable settings, consent
                  requirements, and policies.
                </p>

                <p className="mb-4">
                  Google may use advertising cookies to help serve ads based
                  on a user's previous visits to this website or other
                  websites. Google's advertising systems may also use
                  information for purposes such as ad measurement and
                  frequency management.
                </p>

                <p className="mb-4">
                  The availability and personalization of advertising may
                  depend on the user's location, consent choices, browser
                  settings, Google account settings, and the configuration of
                  the advertising services used by the website.
                </p>

                <p className="font-bold text-gray-900 border-t border-orange-200 pt-5 mt-5 mb-3">
                  Advertising choices
                </p>

                <p className="mb-4">
                  Users can manage certain Google advertising personalization
                  settings through Google's advertising settings and can use
                  other available controls for third-party personalized
                  advertising.
                </p>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 font-bold hover:underline"
                  >
                    Google Ads Settings
                    <FaExternalLinkAlt className="text-xs" />
                  </a>

                  <a
                    href="https://www.aboutads.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 font-bold hover:underline"
                  >
                    AboutAds.info
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </section>

            {/* --- SECTION 4 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaCookieBite size={22} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  4. Cookies and Similar Technologies
                </h2>
              </div>

              <p className="mb-5">
                Hindi Bhajan Manjari may use cookies and similar technologies
                for different purposes. These technologies may be used to
                remember preferences, support essential functionality,
                understand website usage, maintain security, or support
                advertising and measurement.
              </p>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-black text-gray-900 mb-2">
                    Essential functionality
                  </h3>
                  <p className="text-sm text-gray-600">
                    Some storage technologies may be necessary for features,
                    preferences, security, or basic operation of the website.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-black text-gray-900 mb-2">
                    Analytics and measurement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Where analytics or measurement tools are enabled, they may
                    help us understand traffic, page usage, and website
                    performance.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-black text-gray-900 mb-2">
                    Advertising
                  </h3>
                  <p className="text-sm text-gray-600">
                    Advertising providers may use cookies or similar
                    technologies where advertising services are enabled and
                    where applicable consent or other legal requirements have
                    been satisfied.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-black text-gray-900 mb-2">
                    Browser controls
                  </h3>
                  <p className="text-sm text-gray-600">
                    Most browsers allow users to manage or delete cookies
                    through their settings. Disabling certain cookies may
                    affect some website functionality.
                  </p>
                </div>
              </div>
            </section>

            {/* --- SECTION 5 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaDatabase size={22} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  5. User Submissions and Contact Information
                </h2>
              </div>

              <p className="mb-4">
                Hindi Bhajan Manjari allows visitors to submit devotional
                material for editorial consideration. If you use the
                submission form, the information you provide may include:
              </p>

              <ul className="list-disc pl-6 space-y-3 marker:text-orange-500">
                <li>Bhajan or composition title.</li>
                <li>Lyrics or other submitted devotional text.</li>
                <li>Optional melody or Tarz information.</li>
                <li>Optional contributor name.</li>
                <li>Optional email address or WhatsApp/phone number.</li>
              </ul>

              <p className="mt-5 mb-4">
                Submission information may be stored in our database or other
                service infrastructure used to operate the submission system.
                It may be accessed by authorized persons responsible for
                editorial review, moderation, technical maintenance, or
                publication.
              </p>

              <p className="mb-4">
                Providing an email address or WhatsApp number is optional.
                Where provided specifically for submission updates, it may be
                used to contact the submitter regarding the status or
                publication of the submission.
              </p>

              <p>
                Submitting content does not guarantee publication. We may
                review, edit, decline, remove, or request clarification about
                submitted material where appropriate.
              </p>
            </section>

            {/* --- SECTION 6 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaFileContract size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  6. Copyright and Submitted Content
                </h2>
              </div>

              <p className="mb-4">
                Users should only submit lyrics, translations, arrangements,
                images, recordings, or other material when they have the right
                or permission to submit that material, or where the submission
                is otherwise lawful.
              </p>

              <p className="mb-4">
                Traditional devotional works, public-domain works, modern
                compositions, translations, adaptations, arrangements, and
                recordings may have different copyright statuses. The fact
                that a devotional subject is traditional does not necessarily
                mean that every modern version, translation, arrangement, or
                recording is free of copyright.
              </p>

              <p>
                For copyright concerns, please refer to our{' '}
                <Link
                  href="/dmca"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Copyright / DMCA Policy
                </Link>{' '}
                or contact us through our{' '}
                <Link
                  href="/contact"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Contact page
                </Link>.
              </p>
            </section>

            {/* --- SECTION 7 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaExternalLinkAlt size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  7. Third-Party Services and Links
                </h2>
              </div>

              <p className="mb-5">
                Hindi Bhajan Manjari may use or link to third-party services
                for functionality, payments, analytics, advertising,
                communication, content, or other purposes. These services
                operate under their own privacy policies and terms.
              </p>

              <ul className="list-disc pl-6 space-y-4 marker:text-orange-500">
                <li>
                  <strong>Google:</strong> Google services may be used for
                  advertising, measurement, consent management, or other
                  website functionality depending on the services currently
                  enabled.
                </li>

                <li>
                  <strong>Payment providers:</strong> Voluntary contributions
                  may be processed through payment providers such as Razorpay/CashFree.
                  Payment providers may collect and process information
                  required to complete and secure a transaction.
                </li>

                <li>
                  <strong>Amazon:</strong> Hindi Bhajan Manjari participates
                  in the Amazon Associates program. Links to Amazon may
                  contain affiliate tracking, and qualifying purchases may
                  result in a commission at no additional cost to the buyer.
                </li>

                <li>
                  <strong>External websites:</strong> The website may contain
                  links to external websites, platforms, videos, resources,
                  or other services. We are not responsible for the privacy
                  practices or content of third-party websites.
                </li>
              </ul>

              <p className="mt-5">
                Before providing personal information to a third-party service,
                users should review that provider's current privacy policy and
                terms.
              </p>
            </section>

            {/* --- SECTION 8 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaShieldAlt size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  8. Data Security
                </h2>
              </div>

              <p className="mb-4">
                We take reasonable measures to protect information handled
                through the website from unauthorized access, misuse, loss,
                alteration, or disclosure.
              </p>

              <p>
                However, no internet transmission, website, database, or
                electronic storage system can be guaranteed to be completely
                secure. We therefore cannot guarantee absolute security of
                information transmitted to or stored through the website.
              </p>
            </section>

            {/* --- SECTION 9 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaUserShield size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  9. Your Privacy Choices and Rights
                </h2>
              </div>

              <p className="mb-4">
                Depending on where you live and the laws that apply to you,
                you may have rights regarding personal information, such as
                rights to access, correction, deletion, restriction, objection,
                or withdrawal of certain choices.
              </p>

              <p className="mb-4">
                You may also contact us if you want to ask what personal
                information we hold about you, request correction of inaccurate
                information, request deletion where applicable, or ask about
                how your information is being used.
              </p>

              <p>
                We may need to verify a request before taking action and may
                retain information where necessary to comply with legal
                obligations, resolve disputes, prevent fraud, or protect our
                legitimate interests.
              </p>
            </section>

            {/* --- SECTION 10 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaGavel size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  10. Regional Privacy Information
                </h2>
              </div>

              <p className="mb-4">
                Privacy laws vary by country and region. Where applicable,
                Hindi Bhajan Manjari will handle personal information in
                accordance with the rights and obligations required by the
                laws that apply to the relevant processing activity.
              </p>

              <p className="mb-4">
                For visitors in regions such as the European Economic Area,
                the United Kingdom, or Switzerland, certain advertising and
                analytics activities may require consent or other lawful
                processing conditions.
              </p>

              <p>
                Where Google advertising services are used for visitors in
                jurisdictions requiring specific consent mechanisms, the
                website may use Google's Privacy &amp; Messaging solution or
                another applicable consent management platform. Consent
                preferences may affect advertising personalization and other
                processing.
              </p>
            </section>

            {/* --- SECTION 11 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaFileContract size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  11. Children's Privacy
                </h2>
              </div>

              <p className="mb-4">
                Hindi Bhajan Manjari is intended to provide devotional and
                educational content to a general audience. We do not knowingly
                request unnecessary personal information from children.
              </p>

              <p>
                If a parent or guardian believes that a child has provided
                personal information to us without appropriate authorization,
                please contact us so that we can review the situation and take
                appropriate steps where required.
              </p>
            </section>

            {/* --- SECTION 12 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaDatabase size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  12. Data Retention
                </h2>
              </div>

              <p className="mb-4">
                We retain information only for as long as reasonably necessary
                for the purpose for which it was collected, for legitimate
                operational needs, or where retention is required by law.
              </p>

              <p>
                Submission records, correspondence, technical records, and
                other information may therefore be retained for different
                periods depending on their purpose and nature.
              </p>
            </section>

            {/* --- SECTION 13 --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaShieldAlt size={20} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 m-0">
                  13. Changes to This Privacy Policy
                </h2>
              </div>

              <p>
                We may update this Privacy Policy from time to time to reflect
                changes to the website, technologies, services, legal
                requirements, or our privacy practices. When changes are made,
                the updated policy will be published on this page together
                with a revised “Last Updated” date.
              </p>
            </section>

            {/* --- CONTACT SECTION --- */}
            <section className="mt-16 pt-10 border-t border-gray-100 text-center">
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Questions or Privacy Requests?
              </h3>

              <p className="text-gray-600 font-medium mb-6 max-w-2xl mx-auto">
                If you have a privacy question, want to request access or
                correction of your information, or have a concern about how
                information is handled, please contact us through our Contact
                page.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-colors shadow-lg active:scale-95"
                >
                  Contact Us
                </Link>

                <Link 
                  href="/terms" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-black rounded-xl transition-colors border border-orange-200"
                >
                  Terms of Service
                </Link>
              </div>
            </section>

          </div>
        </div>
      </article>
    </div>
  );
}