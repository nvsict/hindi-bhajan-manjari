import {
  FaGavel,
  FaPaperPlane,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBalanceScale,
  FaYoutube,
  FaTimesCircle,
  FaCheckDouble,
  FaBookReader,
  FaFileContract,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'Copyright & DMCA Policy | Hindi Bhajan Manjari',
  description:
    'Copyright and DMCA policy for Hindi Bhajan Manjari. Learn about content ownership, user submissions, embedded media, copyright concerns, and how to report potentially infringing material.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/dmca',
  },
};

export default function DMCAPage() {
  const adminEmail = 'support@hindibhajanmanjari.com';
  const lastUpdated = 'September 13, 2026';

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-red-900 via-gray-900 to-black rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-2xl relative overflow-hidden text-center text-white">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
              <FaGavel size={36} />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              Copyright &amp; DMCA Policy
            </h1>

            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              Hindi Bhajan Manjari respects the intellectual property rights of
              authors, composers, publishers, performers, and other rights
              holders. This policy explains how we handle copyright concerns,
              user submissions, and third-party content.
            </p>

            <div className="mt-8 text-xs font-bold text-gray-900 uppercase tracking-widest bg-white px-6 py-2.5 rounded-full inline-block shadow-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* --- CONTENT CARDS --- */}
        <div className="grid gap-6">

          {/* 1. COPYRIGHT AND CONTENT */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 md:p-10 rounded-[2rem] border border-orange-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200">
                <FaShieldAlt size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  1. Copyright and Content on Hindi Bhajan Manjari
                </h2>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari is a devotional and informational
                  platform intended to help readers discover, read,
                  understand, and explore bhajans, aartis, chalisas, stotrams,
                  devotional literature, and related spiritual content.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  We respect the intellectual property rights of authors,
                  composers, publishers, performers, translators, and other
                  rights holders. Content published on this website may include
                  traditional devotional works, public-domain material where
                  applicable, user-submitted material, references to modern
                  compositions, and original editorial material created by
                  Hindi Bhajan Manjari.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  We do not claim ownership of a devotional work merely because
                  it is published on this website. Where reasonably available,
                  we aim to provide appropriate attribution, source information,
                  creator information, or other relevant context.
                </p>

                <p className="text-gray-700 leading-relaxed m-0 text-[16px]">
                  The copyright status of devotional material can vary. A work
                  being traditional, old, widely circulated, or publicly
                  available online does not by itself mean that every version,
                  translation, adaptation, arrangement, recording, image, or
                  written presentation of that work is free from copyright
                  protection.
                </p>
              </div>
            </div>
          </div>

          {/* 2. OUR ORIGINAL EDITORIAL WORK */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <FaBookReader size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  2. Original Editorial Work
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari may create original editorial material
                  to make devotional content easier to understand and use.
                  This may include our own Bhavarth (explanations), word
                  meanings, translations where created by us, transliterations,
                  contextual notes, introductions, editorial explanations,
                  formatting, categorisation, and other original written
                  contributions.
                </p>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Copyright in original editorial material created by Hindi
                  Bhajan Manjari belongs to the respective rights holder to the
                  extent permitted by applicable law. Such protection does not
                  mean that we claim ownership of an underlying traditional,
                  public-domain, or third-party devotional work.
                </p>

                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  Readers and other websites should not copy, reproduce, or
                  republish our original explanations, translations, editorial
                  notes, or other original written material as their own without
                  appropriate permission where permission is required.
                </p>
              </div>
            </div>
          </div>

          {/* 3. EMBEDDED MEDIA */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                <FaYoutube size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  3. Embedded Media and Third-Party Content
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari may display or embed content made
                  available through third-party platforms, including publicly
                  accessible video players and other embedded media.
                </p>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  An embedded video, recording, thumbnail, image, or other
                  third-party material is not automatically owned by Hindi
                  Bhajan Manjari merely because it appears on or is linked from
                  our website. Ownership and licensing may remain with the
                  relevant creator, publisher, platform, or other rights holder.
                </p>

                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  If you believe that third-party content displayed or embedded
                  on our website infringes your rights, please contact us with
                  the relevant page URL and sufficient information to identify
                  the material. Where appropriate, we may review, update,
                  disable, or remove the relevant content or embedding. A
                  complaint concerning material hosted by a third-party
                  platform may also need to be submitted directly to that
                  platform.
                </p>
              </div>
            </div>
          </div>

          {/* 4. USER SUBMISSIONS */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-10 rounded-[2rem] border border-green-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-200">
                <FaFileContract size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  4. User-Submitted Content
                </h2>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari may allow visitors to submit bhajans,
                  aartis, chalisas, stotrams, lyrics, corrections, source
                  information, or other devotional material for editorial
                  consideration.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  By submitting content, you confirm that you have the right or
                  permission to submit the material, or that your submission is
                  otherwise lawful. You should not submit copyrighted material
                  that you do not have permission or a lawful basis to submit.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  Submitting material does not automatically transfer ownership
                  of copyright to Hindi Bhajan Manjari. We may review, edit,
                  format, attribute, publish, decline, remove, or request
                  clarification about a submission in accordance with our
                  editorial practices and applicable rights.
                </p>

                <p className="text-gray-700 leading-relaxed m-0 text-[16px]">
                  If you submit a composition that belongs to another author,
                  composer, publisher, or rights holder, you are responsible
                  for ensuring that your submission does not improperly
                  reproduce or distribute protected material.
                </p>
              </div>
            </div>
          </div>

          {/* 5. REPORTING INFRINGEMENT */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100">
                <FaExclamationTriangle size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  5. Reporting Copyright Concerns
                </h2>

                <p className="text-gray-600 leading-relaxed mb-6 text-[16px]">
                  If you are a copyright owner or an authorised representative
                  and believe that material available on Hindi Bhajan Manjari
                  infringes your rights, please send us a written copyright
                  complaint containing enough information for us to identify
                  and investigate the matter.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Your full name and contact information',
                      desc: 'Provide your name, email address, and other information reasonably necessary for us to contact you.'
                    },
                    {
                      title: 'Identification of the copyrighted work',
                      desc: 'Clearly identify the original work that you believe is being infringed.'
                    },
                    {
                      title: 'The exact URL or location',
                      desc: 'Provide the complete URL of each page containing the material you want us to review.'
                    },
                    {
                      title: 'Your relationship to the rights holder',
                      desc: 'State whether you are the copyright owner or an authorised representative.'
                    },
                    {
                      title: 'Identification of the material in question',
                      desc: 'Describe or identify the specific text, image, recording, video, or other material that is the subject of your complaint.'
                    },
                    {
                      title: 'Reason for the complaint',
                      desc: 'Explain why you believe the material infringes your copyright or other applicable rights.'
                    },
                    {
                      title: 'Good-faith statement',
                      desc: 'Where applicable, confirm that you believe the disputed use is not authorised by the rights holder, its agent, or applicable law.'
                    },
                    {
                      title: 'Accuracy and authority',
                      desc: 'Confirm that the information provided is accurate and that you are authorised to make the complaint.'
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-yellow-200 transition-colors"
                    >
                      <span className="font-black text-gray-900 text-[15px]">
                        {item.title}
                      </span>

                      <span className="font-medium text-gray-600 text-[13px] leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-500 text-sm italic mt-5">
                  Providing complete and accurate information helps us review a
                  copyright concern efficiently. We may request additional
                  information when necessary.
                </p>
              </div>
            </div>
          </div>

          {/* 6. REVIEW AND ACTION */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
                <FaBalanceScale size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  6. Review and Appropriate Action
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  We review copyright complaints in good faith and may take
                  appropriate action based on the information available to us,
                  the nature of the material, applicable law, and the rights
                  involved.
                </p>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Depending on the circumstances, appropriate action may
                  include correcting attribution, updating a page, requesting
                  clarification, removing or restricting material, disabling an
                  embedding, or declining to publish the material in the future.
                </p>

                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  A copyright complaint does not automatically establish that
                  infringement has occurred. We may consider the information
                  provided by the complainant, the information available about
                  the material, and any relevant response from the person who
                  submitted or provided the content.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* 7. COUNTER-NOTICE */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="text-2xl text-blue-600" />

                <h2 className="text-xl font-black text-gray-900 m-0">
                  7. Counter-Notice or Response
                </h2>
              </div>

              <p className="text-[15px] text-gray-600 leading-relaxed">
                If material has been removed, restricted, or declined following
                a copyright complaint and you believe that action resulted from
                a mistake or misidentification, you may contact us with a
                response explaining your position and identifying the affected
                material. We may review the information provided and take
                appropriate action. A response or counter-notice does not
                guarantee that material will be restored.
              </p>
            </div>

            {/* 8. REPEAT CONCERNS */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaTimesCircle className="text-2xl text-red-600" />

                <h2 className="text-xl font-black text-gray-900 m-0">
                  8. Repeat Copyright Concerns
                </h2>
              </div>

              <p className="text-[15px] text-gray-600 leading-relaxed">
                Hindi Bhajan Manjari takes repeated and credible copyright
                concerns seriously. Where appropriate, we may remove or
                restrict repeatedly disputed material, decline future
                submissions from a contributor, or restrict access to content
                submission features when there are ongoing and credible
                intellectual property concerns.
              </p>
            </div>
          </div>

          {/* 9. CONTENT SOURCES & EDITORIAL APPROACH */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-100">
                <FaBookReader size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  9. Content Sources and Editorial Approach
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari may work with traditional devotional
                  works, public-domain material where applicable, user
                  contributions, source references, and other legitimately
                  available information.
                </p>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  During editorial preparation, we may format text for
                  readability, organise verses, correct obvious typographical
                  errors, provide transliteration, prepare original
                  explanations or meanings, add contextual information, or make
                  other editorial improvements.
                </p>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  The availability of a work or text on another website does not
                  by itself establish that it is public domain or that it may
                  be freely copied. Where reliable information indicates that
                  content should be corrected, attributed differently, removed,
                  or updated, rights holders and knowledgeable contributors are
                  encouraged to contact us.
                </p>

                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  Our aim is to provide a useful and respectful devotional
                  resource while making reasonable efforts to distinguish
                  underlying devotional works from our own editorial
                  contributions and to respond appropriately to legitimate
                  intellectual property concerns.
                </p>
              </div>
            </div>
          </div>

          {/* 10. COPYRIGHT CONTACT */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mt-4 relative overflow-hidden group shadow-2xl border border-gray-800">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

              <div>
                <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                  <FaPaperPlane className="text-blue-400" />
                  10. Copyright Contact
                </h2>

                <p className="text-gray-400 text-[16px] leading-relaxed max-w-lg mb-6">
                  For copyright concerns relating to material published on
                  Hindi Bhajan Manjari, please contact us with the relevant
                  page URL, identification of the material, and information
                  supporting your claim.
                </p>

                <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-xl">
                  <p className="text-gray-300 text-sm font-mono m-0">
                    Subject Line:{' '}
                    <span className="text-white font-bold">
                      Copyright Concern – [Title of Work]
                    </span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-center w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-700 pt-8 md:pt-0 md:pl-8">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
                  Send Notice To:
                </p>

                <a
                  href={`mailto:${adminEmail}`}
                  className="inline-block text-xl md:text-2xl font-mono text-white hover:text-red-400 transition-colors break-all bg-black/30 px-6 py-4 rounded-2xl border border-white/5"
                >
                  {adminEmail}
                </a>
              </div>
            </div>

            {/* Subtle Background Icon */}
            <FaGavel className="absolute -right-8 -bottom-8 text-white/5 text-[15rem] rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          </div>

        </div>

        {/* --- LEGAL LINKS --- */}
        <div className="mt-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-bold">
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-orange-600 transition-colors"
            >
              Privacy Policy
            </Link>

            <span className="text-gray-300">•</span>

            <Link
              href="/terms"
              className="text-gray-600 hover:text-orange-600 transition-colors"
            >
              Terms of Service
            </Link>

            <span className="text-gray-300">•</span>

            <Link
              href="/contact"
              className="text-gray-600 hover:text-orange-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* --- FOOTER CTA --- */}
        <div className="text-center mt-8 bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-500 rounded-full shrink-0">
            <FaCheckDouble />
          </div>

          <div className="text-left">
            <h4 className="text-orange-900 font-black text-lg m-0 leading-none">
              Contribute Responsibly
            </h4>

            <p className="text-orange-800/80 font-medium text-sm mt-1 mb-0">
              Have an original devotional composition, a correction, a reliable
              source, or information that can help improve an existing page?
              You can submit content for editorial review.
            </p>
          </div>

          <Link
            href="/submit"
            className="md:ml-auto whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl transition-colors shadow-sm active:scale-95"
          >
            Submit a Bhajan
          </Link>
        </div>

      </div>
    </div>
  );
}