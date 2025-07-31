import { google } from 'googleapis';
import { prisma } from './prisma';

// Simple approach - just pass the access token directly
export const getGoogleCalendarClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
};

export async function getAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google"
    }
  });

  if (!account?.access_token) {
    throw new Error('No Google access token found');
  }

  return account.access_token;
}

// Utility function to check if user has a valid refresh token
export async function hasValidRefreshToken(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google"
    }
  });

  return !!(account?.refresh_token);
}

// Utility function to get account status for debugging
export async function getAccountStatus(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google"
    }
  });

  if (!account) {
    return { status: 'no_account', message: 'No Google account linked' };
  }

  const isExpired = account.expires_at && account.expires_at < Math.floor(Date.now() / 1000);
  
  return {
    status: 'found',
    hasAccessToken: !!account.access_token,
    hasRefreshToken: !!account.refresh_token,
    isExpired,
    expiresAt: account.expires_at,
    scope: account.scope,
    message: !account.refresh_token 
      ? 'No refresh token - user needs to re-authorize' 
      : isExpired && !account.refresh_token 
      ? 'Token expired and no refresh token available'
      : 'Account looks good'
  };
}

// Complex approach - handles full OAuth flow with database lookup
export async function getCalendarClient(userId: string) {
  console.log('getCalendarClient: Starting for userId:', userId);
  
  try {
    // Get user's Google account tokens
    console.log('getCalendarClient: Searching for Google account in database...');
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: "google"
      }
    });

    console.log('getCalendarClient: Account found:', {
      hasAccount: !!account,
      hasAccessToken: !!account?.access_token,
      hasRefreshToken: !!account?.refresh_token,
      accountId: account?.id,
      providerAccountId: account?.providerAccountId,
      expiresAt: account?.expires_at,
      isExpired: account?.expires_at ? account.expires_at < Math.floor(Date.now() / 1000) : 'unknown'
    });

    if (!account) {
      throw new Error('No Google account found for user. Please sign out and sign back in with Google to re-authenticate.');
    }

    if (!account.access_token) {
      throw new Error('No Google access token found. Please sign out and sign back in with Google to re-authenticate.');
    }

    // Check if token is expired and no refresh token is available
    const isExpired = account.expires_at && account.expires_at < Math.floor(Date.now() / 1000);
    if (isExpired && !account.refresh_token) {
      throw new Error('Google access token has expired and no refresh token is available. Please sign out and sign back in with Google to re-authenticate.');
    }

    console.log('getCalendarClient: Creating OAuth2 client...');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      console.log('getCalendarClient: Token refresh event triggered');
      if (tokens.refresh_token) {
        console.log('getCalendarClient: Updating refresh token in database...');
        try {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: account.providerAccountId
              }
            },
            data: {
              access_token: tokens.access_token,
              expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
            }
          });
          console.log('getCalendarClient: Token updated successfully');
        } catch (updateError) {
          console.error('getCalendarClient: Failed to update token:', updateError);
        }
      }
    });

    console.log('getCalendarClient: Creating Google Calendar client...');
    const calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log('getCalendarClient: Successfully created calendar client');
    
    return calendarClient;
  } catch (error) {
    console.error('getCalendarClient: Error occurred:', error);
    throw error;
  }
}