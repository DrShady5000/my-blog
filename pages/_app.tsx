import '../styles/global.css';
import type { AppProps } from 'next/app';

// Custom App component to initialize pages in the Next.js app
export default function MyApp({ Component, pageProps }: AppProps) {
  // Renders the component for each page with its respective props
  return <Component {...pageProps} />;
}