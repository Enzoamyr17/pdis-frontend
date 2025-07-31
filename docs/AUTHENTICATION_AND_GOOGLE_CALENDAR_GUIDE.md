# PDIS Frontend - Authentication & Google Calendar Integration Guide

## Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Google OAuth Registration Process](#google-oauth-registration-process)
3. [Email & Password Login Process](#email--password-login-process)
4. [Database Schema & Data Access](#database-schema--data-access)
5. [Google Calendar Integration Guide](#google-calendar-integration-guide)
6. [Implementation Examples](#implementation-examples)

## Authentication Overview

This project uses **NextAuth.js** with a dual authentication system:
- **Google OAuth2** for social login
- **Credentials Provider** for email/password authentication

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcryptjs
- **Session Management**: JWT-based sessions

### Authentication Flow Architecture
```
User → Login Page → NextAuth Providers → Database → Session → Dashboard/Profile Completion
```

## Google OAuth Registration Process

### 1. How Google OAuth Works in This Project

The Google OAuth flow is implemented using NextAuth.js GoogleProvider:

```typescript
// src/lib/auth.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

### 2. Registration Flow for New Gmail Users

When a user clicks "Sign in with Google":

1. **OAuth Redirect**: User is redirected to Google's OAuth consent screen
2. **Google Authentication**: User approves access to their Google account
3. **Callback Processing**: Google redirects back with an authorization code
4. **User Creation**: If user doesn't exist, NextAuth automatically creates:
   - User record in the `User` table
   - Account record in the `Account` table (storing Google OAuth tokens)
   - Session record in the `Session` table

5. **Profile Status Check**: The system checks if `profileCompleted` is `false`
6. **Redirect Logic**:
   - If profile incomplete → `/auth/complete-profile`
   - If profile complete → `/dashboard`

### 3. Google OAuth Database Storage

When a user signs in with Google, the following data is stored:

**User Table**:
```sql
id: "cuid_generated_id"
name: "John Doe" (from Google profile)
email: "john@gmail.com" (from Google)
emailVerified: timestamp (from Google)
image: "google_profile_picture_url"
password: null (no password for OAuth users)
profileCompleted: false (default)
```

**Account Table**:
```sql
id: "cuid_generated_id"
userId: "user_id_reference"
type: "oauth"
provider: "google"
providerAccountId: "google_user_id"
refresh_token: "google_refresh_token"
access_token: "google_access_token"
expires_at: timestamp
token_type: "Bearer"
scope: "openid email profile"
id_token: "google_id_token"
```

### 4. Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
```

## Email & Password Login Process

### 1. User Registration Flow

**Registration API**: `POST /api/auth/register`

```typescript
// src/app/api/auth/register/route.ts
export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  
  // 1. Validate input
  // 2. Check if user exists
  // 3. Hash password with bcrypt
  // 4. Create user with profileCompleted: false
  // 5. Return success response
}
```

Registration Process:
1. User fills registration form (currently not implemented in UI)
2. Password is hashed using bcryptjs with salt rounds = 10
3. User record created with `profileCompleted: false`
4. User must complete profile before accessing dashboard

### 2. Login Flow

**Login Process** (handled in `src/app/page.tsx`):

```typescript
const handleCredentialsLogin = async () => {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });
}
```

**Credentials Provider** (in `src/lib/auth.ts`):
1. Validates email/password input
2. Queries user from database by email
3. Verifies password using `bcrypt.compare()`
4. Returns user object if valid, null if invalid

### 3. Session Management

**JWT Configuration**:
```typescript
session: { strategy: "jwt" }

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      // Fetch profileCompleted status from database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      })
      token.profileCompleted = dbUser?.profileCompleted || false
    }
    return token
  },
  
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id as string
      session.user.profileCompleted = token.profileCompleted as boolean
    }
    return session
  }
}
```

## Database Schema & Data Access

### 1. Database Models

**User Model** (Primary user data):
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For email/password auth
  accounts      Account[]
  sessions      Session[]

  // Employee Vital Records
  lastName         String?
  firstName        String?
  middleName       String?
  position         String?
  idNumber         String?        @unique
  employmentDate   DateTime?
  office           Office?
  group            Group?
  department       Department?
  contactNumber    String?
  pdEmail          String?        @unique
  personalEmail    String?        @unique
  birthdate        DateTime?
  addressId        String?
  address          Address?       @relation(fields: [addressId], references: [id])
  permissions      Permission[]

  profileCompleted Boolean        @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Account Model** (OAuth provider data):
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
```

### 2. Database Access Methods

**Viewing Database Data**:

**Option 1: Prisma Studio**
```bash
npx prisma studio
```
- Opens web interface at `http://localhost:5555`
- Browse all tables visually
- Edit records directly

**Option 2: Direct Database Connection**
```bash
# Connect to PostgreSQL directly
psql "postgresql://username:password@host:port/database"

# View users
SELECT * FROM "User";

# View accounts (OAuth data)
SELECT * FROM "Account";

# View sessions
SELECT * FROM "Session";
```

**Option 3: Prisma CLI**
```bash
# Generate and run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database (if seed file exists)
npx prisma db seed
```

### 3. Key Database Queries

**Find user with OAuth accounts**:
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: {
    accounts: true,
    sessions: true,
    address: true,
    permissions: true
  }
})
```

**Check if user registered via Google**:
```typescript
const googleAccount = await prisma.account.findFirst({
  where: {
    userId: userId,
    provider: "google"
  }
})
```

## Google Calendar Integration Guide

### 1. Setup Requirements

To integrate Google Calendar with your authenticated users, you'll need:

1. **Google Cloud Project** with Calendar API enabled
2. **Service Account** or **OAuth 2.0 credentials**
3. **Additional Scopes** for calendar access
4. **FullCalendar.js** for frontend calendar component

### 2. Google Cloud Setup

**Step 1: Enable Calendar API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Google Calendar API"
3. Create credentials (OAuth 2.0 Client ID)

**Step 2: Update OAuth Scopes**
```typescript
// src/lib/auth.ts - Update GoogleProvider
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile https://www.googleapis.com/auth/calendar"
    }
  }
})
```

### 3. Calendar Integration Architecture

```
User Authentication → Google OAuth → Store Tokens → Calendar API Calls → FullCalendar UI
```

### 4. Required Dependencies

```bash
npm install googleapis @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### 5. Implementation Steps

**Step 1: Create Calendar Service**
```typescript
// src/lib/google-calendar.ts
import { google } from 'googleapis';
import { prisma } from './prisma';

export async function getCalendarClient(userId: string) {
  // Get user's Google account tokens
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google"
    }
  });

  if (!account?.access_token) {
    throw new Error('No Google access token found');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}
```

**Step 2: Calendar API Endpoints**

```typescript
// src/app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const calendar = await getCalendarClient(session.user.id);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ events: response.data.items });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, start, end, description, attendees } = await request.json();
    const calendar = await getCalendarClient(session.user.id);

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: start,
        timeZone: 'UTC',
      },
      end: {
        dateTime: end,
        timeZone: 'UTC',
      },
      attendees: attendees?.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return NextResponse.json({ event: response.data });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
```

**Step 3: FullCalendar Component**

```typescript
// src/components/Calendar.tsx
'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      
      const formattedEvents = data.events?.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        allDay: !event.start?.dateTime,
      })) || [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const title = prompt('Event Title:');
    if (!title) return;

    const eventData = {
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    };

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEventClick = async (clickInfo: any) => {
    if (confirm(`Delete event '${clickInfo.event.title}'?`)) {
      try {
        await fetch(`/api/calendar/events/${clickInfo.event.id}`, {
          method: 'DELETE',
        });
        
        clickInfo.event.remove();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
}
```

### 6. Advanced Calendar Features

**Event Management API Routes**:

```typescript
// src/app/api/calendar/events/[eventId]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  // Update event logic
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  // Delete event logic
}
```

**Attendee Management**:
```typescript
// Add to event creation
attendees: [
  { email: 'attendee1@example.com' },
  { email: 'attendee2@example.com' }
],
sendUpdates: 'all', // Send email invitations
```

**Email Groups Integration**:
```typescript
// Create email groups in your database
model EmailGroup {
  id      String @id @default(cuid())
  name    String
  emails  String[] // Array of email addresses
  userId  String
  user    User   @relation(fields: [userId], references: [id])
}
```

### 7. Environment Variables

Add these to your `.env.local`:
```env
# Existing auth variables
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Additional for calendar (if using service account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 8. Token Refresh Handling

```typescript
// src/lib/google-calendar.ts - Add token refresh logic
oauth2Client.on('tokens', async (tokens) => {
  if (tokens.refresh_token) {
    // Update refresh token in database
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
  }
});
```

## Implementation Examples

### 1. Complete Authentication Check

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/calendar/:path*"]
}
```

### 2. Profile Completion Flow

```typescript
// src/app/auth/complete-profile/page.tsx
export default function CompleteProfilePage() {
  const { data: session } = useSession();
  
  const handleSubmit = async (formData: ProfileData) => {
    const response = await fetch('/api/profile/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Update session and redirect to dashboard
      await getSession(); // Refresh session
      router.push('/dashboard');
    }
  };
}
```

### 3. Dashboard Integration

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  const { data: session } = useSession();
  
  if (!session?.user?.profileCompleted) {
    redirect('/auth/complete-profile');
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <Calendar />
    </div>
  );
}
```

## Security Considerations

1. **Token Storage**: OAuth tokens are stored securely in the database
2. **Session Management**: JWT tokens contain minimal data
3. **API Protection**: All calendar endpoints require authentication
4. **Scope Limitation**: Request only necessary Google permissions
5. **Token Refresh**: Implement automatic token refresh for long-lived sessions

## Troubleshooting

**Common Issues**:

1. **OAuth Scope Issues**: Ensure calendar scope is included in Google provider configuration
2. **Token Expiration**: Implement proper token refresh logic
3. **Database Sync**: Ensure Prisma schema matches database structure
4. **CORS Issues**: Configure proper CORS for API routes

**Debug Tools**:
- NextAuth debug mode: `debug: process.env.NODE_ENV === "development"`
- Prisma Studio for database inspection
- Google Calendar API Playground for testing API calls

This guide provides a complete foundation for implementing authentication and Google Calendar integration in your PDIS frontend project.