import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
// You can't use react-icons here, but you can paste the SVG path
import { FaBookOpen } from 'react-icons/fa';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. DYNAMIC PARAMETER (Hinglish Title)
    // We fall back to a generic title if none is provided via query params.
    const title = searchParams.get('title') || 'हिंदी भजन मंजरी - ज्ञान संग्रह';

    // 2. Fetch Logo
    const logoUrl = new URL('/logo.png', req.url).toString();

    // Re-create the FaBookOpen icon path for use in the SVG
    const bookOpenIconPath = "M21.5 3h-5.5a1.5 1.5 0 0 0 -1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h5.5a1.5 1.5 0 0 0 1.5 -1.5v-13.5a1.5 1.5 0 0 0 -1.5 -1.5zM8.5 3h-5.5a1.5 1.5 0 0 0 -1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h5.5a1.5 1.5 0 0 0 1.5 -1.5v-13.5a1.5 1.5 0 0 0 -1.5 -1.5zM12 22a1.5 1.5 0 0 0 -1.5 -1.5h-9a1.5 1.5 0 0 0 -1.5 1.5zM12 22a1.5 1.5 0 0 1 1.5 -1.5h9a1.5 1.5 0 0 1 1.5 1.5z"

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
            // Pure White Background
            backgroundColor: '#ffffff',
            position: 'relative',
            padding: '80px',
            fontFamily: 'serif', // Elegant serif for an editorial feel
          }}
        >
          {/* 🌟 SUBTLE THEME ACCENTS: Saffron top border, Maroon bottom border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '16px', backgroundColor: '#ea580c' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '16px', backgroundColor: '#431407' }} />

          {/* 🌟 LOGO */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={logoUrl} 
            alt="Logo"
            style={{
              width: '140px',
              height: '140px',
              marginBottom: '40px',
              objectFit: 'contain',
            }}
          />

          {/* 🌟 GYAN SANGRAH BADGE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(234, 88, 12, 0.15)', // Saffron tint
              color: '#ea580c', // Saffron-600
              padding: '12px 30px',
              borderRadius: '50px',
              fontSize: 22,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              marginBottom: '30px',
              border: '1px solid rgba(234, 88, 12, 0.3)',
            }}
          >
            {/* FaBookOpen icon via SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{
                marginBottom: '2px', // subtle align
              }}
            >
              <path d={bookOpenIconPath} />
            </svg>
            <span
                style={{
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
            >
              ज्ञान संग्रह
            </span>
          </div>

          {/* 🌟 BLACK TITLE: Massive, clean, high-contrast, elegant serif */}
          <div
            style={{
              fontSize: 85,
              fontWeight: 900,
              color: '#000000', // Pure Black Text
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-2.5px',
              textTransform: 'capitalize',
              // Force wrap safely
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </div>

          {/* 🌟 SUBTLE BRANDING AT BOTTOM */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              fontSize: 24,
              fontWeight: 800,
              color: '#ea580c', // Saffron orange for branding
              fontFamily: 'sans-serif',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            hindibhajanmanjari.com
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