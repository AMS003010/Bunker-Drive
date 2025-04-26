import './globals.css';
import SessionWrapper from './components/SessionWrapper';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';

// ✅ Add this
export const metadata: Metadata = {
  title: 'Bunker – Google Drive Clone',
  description: 'Bunker is a secure and simple Google Drive alternative built for privacy and speed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '8px',
                background: '#1f2937',
                color: '#fff',
              },
              success: {
                icon: '✅',
              },
              error: {
                icon: '⚠️',
                style: {
                  background: '#7f1d1d',
                },
              },
            }}
          />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
