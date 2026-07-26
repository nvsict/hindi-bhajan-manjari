import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hindi Bhajan Manjari',
    short_name: 'Bhajan Manjari',
    description: 'Read and save your favorite Bhajans for offline Puja and Satsang.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ea580c',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    launch_handler: {
      client_mode: 'navigate-existing',
    },
    // 🌟 App Shortcuts Added Here
    shortcuts: [
      {
        name: "मेरा संग्रह (My Sangrah)",
        short_name: "Sangrah",
        description: "अपने सहेजे गए भजनों को पढ़ें",
        url: "/saved",
        icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "आज का भजन (Today's Bhajan)",
        short_name: "Today",
        description: "आज का विशेष भजन पढ़ें",
        url: "/",
        icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }]
      }
    ]
  } as any // Use 'as any' if TypeScript complains about the 'shortcuts' property not being strictly typed in MetadataRoute yet
}