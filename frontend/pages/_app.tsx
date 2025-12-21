import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import TenantThemeProvider from '../contexts/TenantThemeContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TenantThemeProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </TenantThemeProvider>
  );
}
