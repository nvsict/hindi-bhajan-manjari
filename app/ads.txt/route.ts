export const revalidate = 86400; // हर 24 घंटे (86400 सेकंड) में कैश अपडेट करें

export async function GET() {
  try {
    // Journey (Mediavine) के लाइव URL से डेटा मंगाएं
    const response = await fetch(
      'https://adstxt.journeymv.com/sites/a95f11d6-3dfd-41e5-b8c4-1e5d54d7e561/ads.txt'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ads.txt from Journey');
    }

    const text = await response.text();

    // इसे plain text के रूप में रिटर्न करें ताकि क्रॉलर्स इसे सही से पढ़ सकें
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dynamic ads.txt:", error);
    return new Response("Error fetching ads.txt", { status: 500 });
  }
}