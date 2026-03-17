import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hindi Bhajan Manjari',
    short_name: 'Bhajan Manjari',
    description: 'Read and save your favorite Bhajans for offline Puja and Satsang.',
    start_url: '/',
    display: 'standalone', // This hides the browser UI (URL bar) so it looks like a native app
    background_color: '#ffffff',
    theme_color: '#ea580c', // Your signature Saffron orange
    icons: [
      {
        src: '/logo.png', // Reusing the logo you just uploaded!
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}