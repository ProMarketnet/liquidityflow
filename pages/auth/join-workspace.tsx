import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Head from 'next/head';

interface InvitationDetails {
  id: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
  isValid: boolean;
}

export default function JoinWorkspacePage() {
  const router = useRouter();
  const { token, email } = router.query;
  const { login, authenticated, user, ready } = usePrivy();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    container: {
      maxWidth: '500px',
      width: '100%'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center' as const,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem',
      lineHeight: 1.5
    },
    button: {
      background: '#2563eb',
      color: '#ffffff',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    errorButton: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    workspaceInfo: {
      background: '#f0f7ff',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    },
    roleTag: {
      background: '#dcfce7',
      color: '#166534',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      display: 'inline-block',
      marginBottom: '1rem'
    }
  };

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    loadInvitationDetails();
  }, [token, email]);

  useEffect(() => {
    if (ready && authenticated && user && invitation?.isValid) {
      // User is authenticated, join the workspace
      handleWorkspaceJoin();
    }
  }, [ready, authenticated, user, invitation]);

  const loadInvitationDetails = async () => {
    try {
      console.log(`🔗 Loading invitation details for token: ${token}`);
      
      // Mock invitation validation (in production, call API)
      const mockInvitation = getMockInvitationDetails(token as string, email as string);
      
      if (!mockInvitation.isValid) {
        setError('This invitation has expired or is invalid');
        setIsLoading(false);
        return;
      }

      setInvitation(mockInvitation);
      setIsLoading(false);
      
      console.log(`✅ Invitation validated: ${mockInvitation.workspaceName} (${mockInvitation.role})`);
    } catch (error) {
      console.error('❌ Error loading invitation:', error);
      setError('Failed to load invitation details');
      setIsLoading(false);
    }
  };

  const handlePrivyLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('❌ Privy login failed:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  const handleWorkspaceJoin = async () => {
    if (!user || !invitation || isJoining) return;

    setIsJoining(true);
    try {
      console.log(`🏢 Joining workspace: ${invitation.workspaceName}`);
      
      // Verify email matches
      if (!user.email?.address || user.email.address !== email) {
        setError('Please sign in with the invited email address: ' + email);
        setIsJoining(false);
        return;
      }

      // In production, call API to add user to workspace
      // await fetch('/api/workspaces/join', { ... })
      
      // Mock successful join
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store workspace access in localStorage
      localStorage.setItem('userEmail', user.email.address);
      localStorage.setItem('currentWorkspaceId', getWorkspaceIdFromInvitation(invitation));
      
      console.log(`✅ Successfully joined: ${invitation.workspaceName}`);
      
      // Redirect to portfolio management
      router.push('/admin/portfolios?joined=true');
      
    } catch (error) {
      console.error('❌ Failed to join workspace:', error);
      setError('Failed to join workspace. Please try again.');
      setIsJoining(false);
    }
  };

  // Mock invitation data (in production, fetch from API)
  const getMockInvitationDetails = (token: string, email: string): InvitationDetails => {
    const invitations: { [key: string]: InvitationDetails } = {
      'inv_xtc_jane': {
        id: 'inv_xtc_jane',
        workspaceName: 'XTC Company',
        inviterName: 'John Smith',
        role: 'ADMIN',
        expiresAt: '2024-02-15T10:00:00Z',
        isValid: email === 'jane@email.com'
      },
      'inv_test_guest': {
        id: 'inv_test_guest',
        workspaceName: 'Personal Workspace',
        inviterName: 'Test User',
        role: 'GUEST',
        expiresAt: '2024-02-20T10:00:00Z',
        isValid: email === 'guest@example.com'
      }
    };

    return invitations[token] || {
      id: token,
      workspaceName: 'Unknown Workspace',
      inviterName: 'Unknown User',
      role: 'GUEST',
      expiresAt: '2024-01-01T00:00:00Z',
      isValid: false
    };
  };

  const getWorkspaceIdFromInvitation = (invitation: InvitationDetails): string => {
    const workspaceMap: { [key: string]: string } = {
      'XTC Company': 'ws_xtc_company',
      'Personal Workspace': 'ws_personal_test'
    };
    
    return workspaceMap[invitation.workspaceName] || 'ws_unknown';
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={styles.title}>Loading Invitation...</h1>
            <p style={styles.subtitle}>
              Validating your workspace invitation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Invalid Invitation - LiquidFlow</title>
        </Head>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.card}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h1 style={styles.title}>Invitation Error</h1>
              <p style={styles.subtitle}>{error}</p>
              <button 
                onClick={() => router.push('/')}
                style={styles.errorButton}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!invitation?.isValid) {
    return (
      <>
        <Head>
          <title>Invalid Invitation - LiquidFlow</title>
        </Head>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.card}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h1 style={styles.title}>Invitation Expired</h1>
              <p style={styles.subtitle}>
                This invitation link has expired or is no longer valid.
                Please contact the workspace owner for a new invitation.
              </p>
              <button 
                onClick={() => router.push('/')}
                style={styles.errorButton}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isJoining) {
    return (
      <>
        <Head>
          <title>Joining Workspace - LiquidFlow</title>
        </Head>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.card}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h1 style={styles.title}>Joining Workspace...</h1>
              <p style={styles.subtitle}>
                Adding you to {invitation.workspaceName}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Join {invitation.workspaceName} - LiquidFlow</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h1 style={styles.title}>Workspace Invitation</h1>
            
            <div style={styles.workspaceInfo}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>
                {invitation.workspaceName}
              </h2>
              <div style={styles.roleTag}>
                {invitation.role}
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                <strong>{invitation.inviterName}</strong> has invited you to join this workspace
              </p>
            </div>

            {!authenticated ? (
              <>
                <p style={styles.subtitle}>
                  Sign in with <strong>{email}</strong> to accept this invitation and join the workspace.
                </p>
                <button onClick={handlePrivyLogin} style={styles.button}>
                  🔐 Sign In with Privy
                </button>
              </>
                                      ) : (user && user.email?.address === email) ? (
               <>
                 <p style={styles.subtitle}>
                   ✅ Authenticated as <strong>{user.email?.address}</strong>
                  <br />
                  Ready to join the workspace!
                </p>
                <button onClick={handleWorkspaceJoin} style={styles.button}>
                  🏢 Join {invitation.workspaceName}
                </button>
              </>
            ) : (
              <>
                <p style={{ ...styles.subtitle, color: '#dc2626' }}>
                  ⚠️ You're signed in as <strong>{user?.email?.address}</strong>,
                  but this invitation is for <strong>{email}</strong>.
                  <br />
                  Please sign out and sign in with the correct email.
                </p>
                <button onClick={handlePrivyLogin} style={styles.button}>
                  🔄 Sign In with Correct Email
                </button>
              </>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
              As a {invitation.role.toLowerCase()}, you'll be able to:
              <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                {invitation.role === 'ADMIN' ? (
                  <>
                    <li>Manage client wallets and pools</li>
                    <li>Generate reports</li>
                    <li>View all workspace data</li>
                  </>
                ) : (
                  <>
                    <li>View client wallets and pools</li>
                    <li>Access reports</li>
                    <li>View workspace analytics</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 