import './globals.css'

export const metadata = {
  title: 'AICart',
  description: 'Your marketplace command center',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
