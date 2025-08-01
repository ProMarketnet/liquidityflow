import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  // Force CSS cache busting
  const cssVersion = Date.now();
  
  return (
    <>
      <Head>
        {/* Force CSS reload with versioning */}
        <link 
          rel="stylesheet" 
          href={`/styles/globals.css?v=${cssVersion}`}
          key={`css-${cssVersion}`}
        />
        <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta name="pragma" content="no-cache" />
        <meta name="expires" content="0" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
