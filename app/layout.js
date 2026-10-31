import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'PROGRESS TECH OFFICIAL',
  description: 'Progress Tech Official - Ethical hacking, cybersecurity, web development, Python, Linux and penetration testing training.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
