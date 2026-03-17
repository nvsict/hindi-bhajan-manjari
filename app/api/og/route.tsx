import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. DYNAMIC PARAMETER (Hinglish Title Only)
    const title = searchParams.get('title') || 'Hindi Bhajan Manjari';

    // 2. Fetch Logo
    const logoUrl = new URL('/logo.png', req.url).toString();

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
            // Subtle radial gradient makes the white feel premium, not flat
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #f9fafb 100%)',
            position: 'relative',
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 🌟 ELEGANT FRAME: Prevents WhatsApp from blending the image into light-mode chats */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              bottom: '24px',
              left: '24px',
              right: '24px',
              border: '2px solid rgba(234, 88, 12, 0.1)', // Very faint saffron border
              borderRadius: '24px',
            }}
          />

          {/* 🌟 TOP ACCENT BAR: Beautiful gradient combining your theme colors */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: '15%', 
              right: '15%', 
              height: '8px', 
              backgroundImage: 'linear-gradient(90deg, #ea580c, #431407)', 
              borderBottomLeftRadius: '12px', 
              borderBottomRightRadius: '12px' 
            }} 
          />

          {/* 🌟 WATERMARK: Large, centered logo with extremely low opacity for texture */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Watermark"
            style={{
              position: 'absolute',
              width: '550px',
              height: '550px',
              opacity: 0.03, // Just enough to add texture to the white space
              objectFit: 'contain',
            }}
          />

          {/* 🌟 CENTER SAFE ZONE: Ensures nothing gets cropped on WhatsApp */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              maxWidth: '80%', // Keeps text away from the edges
            }}
          >
            {/* Main Visible Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoUrl} 
              alt="Logo"
              style={{
                width: '110px',
                height: '110px',
                marginBottom: '40px',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 15px rgba(234, 88, 12, 0.15))',
              }}
            />

            {/* BLACK TITLE: Clean, slightly off-black for better screen rendering */}
            <div
              style={{
                fontSize: 76, // Slightly scaled down to fit longer titles safely
                fontWeight: 900,
                color: '#111827', // Very dark slate (looks better than pure #000)
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: '-1.5px',
                textTransform: 'capitalize',
                wordBreak: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                marginBottom: '50px',
              }}
            >
              {title}
            </div>

            {/* 🌟 BRANDING PILL: Instead of plain text, it sits in an elegant container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff7ed', // Very light orange tint
                border: '1px solid #ffedd5',
                padding: '12px 32px',
                borderRadius: '50px',
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#ea580c', // Saffron orange
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
              >
                hindibhajanmanjari.com
              </span>
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