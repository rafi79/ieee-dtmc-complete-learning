import './globals.css'

export const metadata = {
  title: 'IEEE 802.15.6 DTMC Complete Learning Experience',
  description: 'Interactive mathematical tutorial and simulation for IEEE 802.15.6 slotted Aloha DTMC analysis',
  keywords: 'IEEE 802.15.6, DTMC, Markov Chain, Wireless Networks, WBAN, Mathematics Tutorial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
