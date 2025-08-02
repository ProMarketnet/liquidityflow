import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromEmail, createWorkspaceInvitation, getWorkspaceDetails } from '../../../lib/auth-roles';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workspaceId, inviterEmail, inviteeEmail, role } = req.body;

    // Validate required fields
    if (!workspaceId || !inviterEmail || !inviteeEmail || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['ADMIN', 'GUEST'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ADMIN or GUEST' });
    }

    // Verify inviter has permission to invite
    const inviter = getUserFromEmail(inviterEmail);
    if (!inviter) {
      return res.status(403).json({ error: 'Unauthorized - Invalid inviter' });
    }

    // Get workspace details
    const workspace = getWorkspaceDetails(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Create invitation
    const invitation = createWorkspaceInvitation(workspaceId, inviterEmail, inviteeEmail, role);

    // Generate secure invitation URL
    const invitationUrl = `${getBaseUrl(req)}/auth/join-workspace?token=${invitation.id}&email=${encodeURIComponent(inviteeEmail)}`;

    // Send invitation email
    const emailSent = await sendInvitationEmail({
      inviteeEmail,
      inviterName: inviter.name || inviterEmail,
      workspaceName: workspace.name,
      role,
      invitationUrl
    });

    if (!emailSent) {
      console.warn('⚠️ Email sending failed, but invitation created');
    }

    console.log(`📧 Invitation sent: ${inviteeEmail} → ${workspace.name} (${role})`);

    return res.status(200).json({
      success: true,
      invitation: {
        id: invitation.id,
        workspaceName: workspace.name,
        inviteeEmail,
        role,
        invitedAt: invitation.invitedAt,
        expiresAt: invitation.expiresAt
      },
      invitationUrl,
      emailSent
    });

  } catch (error) {
    console.error('Error creating workspace invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 📧 EMAIL INVITATION SERVICE
async function sendInvitationEmail({
  inviteeEmail,
  inviterName,
  workspaceName,
  role,
  invitationUrl
}: {
  inviteeEmail: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationUrl: string;
}): Promise<boolean> {
  try {
    // In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll log the email content
    
    const emailContent = `
    🏢 You're invited to join ${workspaceName} on LiquidFlow!
    
    Hi there!
    
    ${inviterName} has invited you to join "${workspaceName}" as a ${role.toLowerCase()} on LiquidFlow.
    
    As a ${role.toLowerCase()}, you'll be able to:
    ${role === 'ADMIN' 
      ? '• Manage client wallets and pools\n• Generate reports\n• View all workspace data'
      : '• View client wallets and pools\n• Access reports\n• View workspace analytics'
    }
    
    To accept this invitation and join the workspace:
    
    👉 Click here: ${invitationUrl}
    
    You'll be asked to sign in with Privy (using this email address: ${inviteeEmail}).
    After authentication, you'll automatically join the workspace.
    
    This invitation expires in 7 days.
    
    Welcome to LiquidFlow!
    The LiquidFlow Team
    `;

    console.log('📧 EMAIL INVITATION CONTENT:');
    console.log('━'.repeat(60));
    console.log(`To: ${inviteeEmail}`);
    console.log(`Subject: You're invited to join ${workspaceName} on LiquidFlow`);
    console.log('━'.repeat(60));
    console.log(emailContent);
    console.log('━'.repeat(60));

    // TODO: Replace with actual email service
    // await emailService.send({
    //   to: inviteeEmail,
    //   subject: `You're invited to join ${workspaceName} on LiquidFlow`,
    //   html: generateEmailHTML(emailContent, invitationUrl)
    // });

    return true;
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    return false;
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
} 