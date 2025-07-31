import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAccountStatus } from '@/lib/google-calendar';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountStatus = await getAccountStatus(session.user.id);
    
    return NextResponse.json({
      userId: session.user.id,
      userEmail: session.user.email,
      accountStatus,
      recommendations: accountStatus.hasRefreshToken 
        ? ['Account is properly configured for calendar access']
        : [
            'User needs to sign out and sign back in with Google',
            'Make sure to grant calendar permissions during sign-in',
            'If still no refresh token, revoke app permissions in Google Account settings first'
          ]
    });
  } catch (error) {
    console.error('Account status check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check account status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}