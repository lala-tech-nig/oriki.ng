import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'ORIKI.NG — Yoruba Knowledge Zone',
  description: 'Explore Yoruba heritage, news, histories, folk tales, kings, virtual 3D museum, and learn the Yoruba language. The premier digital home of Yoruba culture.',
  keywords: 'Yoruba, Oriki, Culture, Heritage, Nigeria, Virtual Museum, Yoruba Language, History',
  openGraph: {
    title: 'ORIKI.NG — Yoruba Knowledge Zone',
    description: 'The premier digital home of Yoruba culture',
    type: 'website',
    locale: 'en_NG',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1A3A2F', color: '#F5EDD8', border: '1px solid rgba(200,151,58,0.3)' },
              success: { iconTheme: { primary: '#C8973A', secondary: '#0D1B15' } },
            }}
          />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
