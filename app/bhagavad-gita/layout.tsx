import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Shrimad Bhagavad Gita in Hindi',
    default: 'श्रीमद्भगवद्गीता (Shrimad Bhagavad Gita) - सभी 18 अध्याय और 700 श्लोक भावार्थ सहित',
  },
  description: 'संपूर्ण श्रीमद्भगवद्गीता के सभी 18 अध्याय और 700 श्लोकों का प्रामाणिक संस्कृत मूल पाठ, हिंदी अनुवाद एवं आध्यात्मिक भावार्थ। दैनिक स्वाध्याय एवं श्लोक ज्ञान।',
  keywords: [
    'Bhagavad Gita in Hindi', 'Shrimad Bhagavad Gita', 'Gita Slokas with Meaning', 
    'भगवद्गीता हिंदी', 'गीता के 18 अध्याय', 'गीता श्लोक भावार्थ', 'Krishna Arjun Samvad'
  ],
  alternates: {
    canonical: `${siteUrl}/bhagavad-gita`,
  },
  openGraph: {
    title: 'श्रीमद्भगवद्गीता - संपूर्ण 18 अध्याय और 700 श्लोक',
    description: 'भगवान श्री कृष्ण द्वारा अर्जुन को दिया गया दिव्य ज्ञान। संस्कृत मूल श्लोक, हिंदी अनुवाद व भावार्थ।',
    url: `${siteUrl}/bhagavad-gita`,
    siteName: 'Hindi Bhajan Manjari',
    images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630, alt: 'Shrimad Bhagavad Gita' }],
    type: 'website',
  },
};

export default function BhagavadGitaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gitaBookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${siteUrl}/bhagavad-gita#book`,
    "name": "श्रीमद्भगवद्गीता (Shrimad Bhagavad Gita)",
    "alternateName": "Bhagavad Gita",
    "author": {
      "@type": "Person",
      "name": "महर्षि वेदव्यास (Sage Veda Vyasa)"
    },
    "inLanguage": ["sa", "hi", "en"],
    "description": "हिंदू धर्म का सबसे पवित्र ग्रंथ, जिसमें भगवान श्री कृष्ण द्वारा कुरुक्षेत्र के युद्ध मैदान में अर्जुन को दिया गया दिव्य उपदेश संकलित है।",
    "url": `${siteUrl}/bhagavad-gita`,
    "publisher": {
      "@type": "Organization",
      "name": "Hindi Bhajan Manjari",
      "url": siteUrl
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gitaBookSchema) }}
      />
      {children}
    </>
  );
}
