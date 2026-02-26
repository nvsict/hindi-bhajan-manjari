import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Hindi Bhajan Manjari';
    const subtitle = searchParams.get('subtitle') || 'Authentic Lyrics & Meanings';
    const badge = searchParams.get('badge') || '🙏 Devotional Sangrah';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Deep regal Saffron/Maroon gradient background
            backgroundColor: '#431407',
            backgroundImage: 'linear-gradient(135deg, #431407 0%, #ea580c 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 🌟 Decorative Glowing Orbs in the Background */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              left: '-150px',
              width: '700px',
              height: '700px',
              backgroundImage: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(0,0,0,0) 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-200px',
              right: '-100px',
              width: '900px',
              height: '900px',
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
              borderRadius: '50%',
            }}
          />

          {/* 🌟 Glassmorphism Inner Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              // Semi-transparent white creates the "Glass" effect
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '40px',
              width: '85%',
              height: '80%',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
              position: 'relative',
            }}
          >
            {/* SVG Lotus Icon */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24" // amber-400
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: '24px' }}
            >
              <path d="M12 2c0 0-4 4-4 10a4 4 0 0 0 8 0c0-6-4-10-4-10z" />
              <path d="M12 12c-4 0-8 2-8 6a4 4 0 0 0 8 0c0-4 4-6 4-6z" />
              <path d="M12 12c4 0 8 2 8 6a4 4 0 0 1-8 0c0-4-4-6-4-6z" />
              <path d="M12 22v-4" />
            </svg>

            {/* Glowing Pill Badge */}
            <div
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.15)', // Amber tint
                color: '#fcd34d', // amber-300
                padding: '10px 28px',
                borderRadius: '50px',
                fontSize: 22,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '30px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              {badge}
            </div>

            {/* Main Title (High Contrast White & BOLD, with wrap support) */}
            <div
              style={{
                fontSize: 40, // Slightly larger
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1,
                marginBottom: '10px',
                maxWidth: '95%', // Allowed to be wider
                textShadow: '0 4px 15px rgba(0,0,0,0.4)',
                textAlign: 'center',
                letterSpacing: '-1px',
                WebkitTextStroke: '1px #ffffff',
                // 🌟 CSS to handle long text and force wrapping
                wordBreak: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3, // Limit to 3 lines maximum
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </div>

            {/* Subtitle (Soft Orange) */}
            <div
              style={{
                fontSize: 30,
                color: '#fdba74', // orange-300
                fontWeight: 500,
                marginBottom: '10px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {subtitle}
            </div>

            {/* Bottom Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 22,
                color: '#fef3c7', // amber-50
                fontWeight: 600,
                letterSpacing: '2px',
                opacity: 0.7,
                textTransform: 'uppercase',
              }}
            >
              hindibhajanmanjari.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}