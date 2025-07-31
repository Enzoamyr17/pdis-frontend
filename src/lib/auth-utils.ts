import { prisma } from "./prisma"

/**
 * Utility function to clean up Google accounts without refresh tokens
 * This forces users to re-authenticate and get fresh tokens
 */
export async function cleanupGoogleAccountsWithoutRefreshTokens() {
  try {
    const accountsWithoutRefreshTokens = await prisma.account.findMany({
      where: {
        provider: "google",
        refresh_token: null
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (accountsWithoutRefreshTokens.length > 0) {
      console.log(`Found ${accountsWithoutRefreshTokens.length} Google accounts without refresh tokens`);
      
      for (const account of accountsWithoutRefreshTokens) {
        console.log(`Cleaning up account for user: ${account.user.email}`);
      }

      const result = await prisma.account.deleteMany({
        where: {
          provider: "google",
          refresh_token: null
        }
      });

      console.log(`Cleaned up ${result.count} Google accounts without refresh tokens`);
      return result.count;
    } else {
      console.log('No Google accounts without refresh tokens found');
      return 0;
    }
  } catch (error) {
    console.error('Error cleaning up Google accounts:', error);
    throw error;
  }
}

/**
 * Check if a user has a valid Google account with refresh token
 */
export async function hasValidGoogleAccount(userId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
        refresh_token: {
          not: null
        }
      }
    });

    return !!account;
  } catch (error) {
    console.error('Error checking Google account validity:', error);
    return false;
  }
}