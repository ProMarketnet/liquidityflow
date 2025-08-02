import type { AppProps } from 'next/app';
import PrivyProvider from '../components/PrivyProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider>
      <Component {...pageProps} />
    </PrivyProvider>
  );
}
