export const metadata = {
  title: 'IzziOrder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="manifest" href="favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
