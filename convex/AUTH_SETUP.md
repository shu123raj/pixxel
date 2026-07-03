# User Authentication Backend Setup - Complete Guide

## Backend Functions Available

Your Convex backend now includes complete user authentication management with the following functions:

### 1. **store** (Mutation) - PRIMARY AUTH FUNCTION
Handles user creation and authentication logging automatically when users sign in/up.
```javascript
// This is called automatically by the useStoreUser hook
// No need to call this manually
const storeUser = useMutation(api.users.store);
await storeUser({});
```

### 2. **signUp** (Mutation)
Updates user profile with additional information after initial sign-up.
```javascript
const signUpMutation = useMutation(api.users.signUp);
await signUpMutation({
  name: "John Doe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  company: "Acme Corp",
  // ... other optional fields
});
```

### 3. **getCurrentUser** (Query)
Retrieves the currently authenticated user's information.
```javascript
import { useQuery } from "convex/react";

const currentUser = useQuery(api.users.getCurrentUser);
```

### 4. **getUserByEmail** (Query)
Fetches a user by their email address.
```javascript
const user = useQuery(api.users.getUserByEmail, { email: "john@example.com" });
```

### 5. **updateUserProfile** (Mutation)
Updates user's profile information including all customer details.
```javascript
await updateProfileMutation({
  name: "John Updated",
  firstName: "John",
  lastName: "Updated",
  phone: "+1987654321",
  company: "New Company",
  jobTitle: "Senior Designer",
  newsletter: false,
  // ... any other fields to update
});
```

### 6. **updateUserPlan** (Mutation)
Changes user's subscription plan (free or pro).
```javascript
await updatePlanMutation({ plan: "pro" });
```

### 7. **getAllUsers** (Query)
Retrieves all users (for admin purposes).
```javascript
const allUsers = useQuery(api.users.getAllUsers);
```

## Using the Custom Hooks

The easiest way to manage authentication is using the provided custom hooks in `hooks/use-auth.js`:

### useAuthUser Hook
Complete auth management hook that handles everything.
```javascript
import { useAuthUser } from "@/hooks/use-auth";

export default function MyComponent() {
  const {
    currentUser,
    isReady,
    isSignedIn,
    signIn,
    signUp,
    updateProfile,
    updatePlan
  } = useAuthUser();

  if (!isReady) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <div>Please sign in first</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser?.name}!</h1>
      <p>Email: {currentUser?.email}</p>
      <p>Plan: {currentUser?.plan}</p>
      <p>Company: {currentUser?.company}</p>
    </div>
  );
}
```

#### Sign Up with Full Customer Information
```javascript
const { signUp } = useAuthUser();

await signUp({
  name: "John Doe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  dateOfBirth: "1990-01-01",
  streetAddress: "123 Main St",
  city: "Anytown",
  state: "CA",
  zipCode: "12345",
  country: "USA",
  company: "Acme Corp",
  jobTitle: "Designer",
  newsletter: true,
  marketingEmails: false,
});
```

### useCurrentUser Hook
Simple hook to get the current user.
```javascript
import { useCurrentUser } from "@/hooks/use-auth";

export default function UserProfile() {
  const currentUser = useCurrentUser();

  return <h1>Welcome, {currentUser?.name}</h1>;
}
```

### useSignIn Hook
Standalone sign-in hook.
```javascript
import { useSignIn } from "@/hooks/use-auth";

export default function LoginButton() {
  const { signIn } = useSignIn();

  const handleLogin = async () => {
    const result = await signIn();
    if (result.success) {
      console.log("Signed in:", result.user);
    } else {
      console.error("Sign in failed:", result.error);
    }
  };

  return <button onClick={handleLogin}>Sign In</button>;
}
```

### useSignUp Hook
Standalone sign-up hook.
```javascript
import { useSignUp } from "@/hooks/use-auth";

export default function SignupForm() {
  const { signUp } = useSignUp();

  const handleSignup = async () => {
    const result = await signUp("John Doe", "john@example.com");
    if (result.success) {
      console.log("Signed up:", result.user);
    } else {
      console.error("Sign up failed:", result.error);
    }
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

## User Data Model

Users are stored in the Convex database with the following structure:

```javascript
{
  _id: string,           // Unique document ID
  name: string,          // User's display name
  email: string,         // User's email address
  tokenIdentifier: string, // Clerk token identifier
  imageUrl: string,      // Profile picture URL (optional)
  plan: "free" | "pro",  // Subscription plan
  projectsUsed: number,  // Number of projects created
  exportsThisMonth: number, // Monthly export count
  createdAt: number,     // Account creation timestamp
  lastActiveAt: number,  // Last activity timestamp
  _creationTime: number  // Internal Convex creation time
}
```

## Integration with Clerk Authentication

The app uses Clerk for authentication. The flow is:
1. User signs in with Clerk (managed by `/app/(auth)/sign-in` page)
2. Clerk provides an authentication token
3. Convex verifies this token in `auth.config.js`
4. User data is automatically created/synced in Convex database

## Database Indexes

The users table has the following indexes for optimal performance:
- `by_token`: Fast lookup by Clerk token identifier
- `by_email`: Fast lookup by email address
- `search_name`: Full-text search by name
- `search_email`: Full-text search by email

## Example: Complete Sign-In Flow

```javascript
"use client";

import { useAuthUser } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, isReady, isSignedIn } = useAuthUser();

  useEffect(() => {
    if (isReady && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isReady, isSignedIn, router]);

  if (!isReady) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {currentUser?.name}</h1>
      <div>
        <p>Email: {currentUser?.email}</p>
        <p>Plan: {currentUser?.plan}</p>
        <p>Projects: {currentUser?.projectsUsed}</p>
        <p>Member since: {new Date(currentUser?.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
```

## Notes

- All authentication is handled through Clerk integration
- User data is automatically synced between Clerk and Convex
- The database indexes enable fast queries for common operations
- `lastActiveAt` is automatically updated on each sign-in
- Free users default to "free" plan, upgradeable to "pro"
