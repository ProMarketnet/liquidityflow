import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TestVisibilityPage() {
  return (
    <>
      <Head>
        <title>Visibility Test - LiquidFlow</title>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          border: '3px solid #ffffff',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '800px',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
        }}>
          
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>🚀</div>
          
          <h1 style={{
            color: '#ffffff',
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 1)',
            fontFamily: 'Arial, sans-serif'
          }}>
            VISIBILITY TEST
          </h1>
          
          <h2 style={{
            color: '#ffffff',
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
            fontFamily: 'Arial, sans-serif'
          }}>
            Connect Your Wallet
          </h2>
          
          <p style={{
            color: '#ffffff',
            fontSize: '1.5rem',
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6'
          }}>
            This is a test page to verify text visibility. If you can read this clearly, 
            the deployment is working and we can apply these styles to the main onboarding page.
          </p>
          
          <button style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            padding: '1rem 2rem',
            border: '2px solid #ffffff',
            borderRadius: '10px',
            cursor: 'pointer',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            🔗 VISIBILITY TEST BUTTON
          </button>
          
          <div style={{ marginTop: '2rem' }}>
            <Link href="/" style={{
              color: '#ffffff',
              fontSize: '1.125rem',
              textDecoration: 'underline',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 1)'
            }}>
              ← Back to Home
            </Link>
          </div>
          
        </div>
        
                 <div style={{
           marginTop: '2rem',
           color: '#ffffff',
           fontSize: '1rem',
           textAlign: 'center',
           textShadow: '1px 1px 2px rgba(0, 0, 0, 1)'
         }}>
           <p>If this text is clearly visible, Railway deployment is working correctly.</p>
           <p>Test URL: /test-visibility</p>
           <p style={{color: '#ff4444', fontWeight: 'bold'}}>FORCE DEPLOY - Version 2</p>
         </div>
        
      </div>
    </>
  );
} 