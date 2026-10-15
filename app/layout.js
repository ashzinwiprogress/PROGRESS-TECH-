import './globals.css';

export const metadata = {
  title: 'PROGRESS TECH OFFICIAL',
  description: 'Progress Tech Official - Ethical hacking, cybersecurity, web development, Python, Linux and penetration testing training.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
