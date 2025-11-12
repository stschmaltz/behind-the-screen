# AI Usage Tracking System

## Overview

This system tracks AI generation usage per user with a weekly limit of 25 generations. The limit automatically resets every 7 days.

## Features

### 1. User Limits

- **Weekly Limit**: 25 AI generations per user
- **Auto-Reset**: Usage count resets automatically after 7 days
- **Cost**: ~2.5 cents per user per week (25 generations × ~0.1 cent each)

### 2. API Endpoints

#### `/api/ai-usage/check` (GET)

Check current user's AI usage status.

**Response:**

```json
{
  "canUse": true,
  "remaining": 23,
  "limit": 25,
  "resetDate": "2025-11-19T00:00:00.000Z"
}
```

#### `/api/ai-usage/track` (POST)

Track/increment AI usage for the current user.

**Success Response:**

```json
{
  "success": true,
  "usage": 2,
  "remaining": 23,
  "limit": 25
}
```

**Error Response (429 - Limit Reached):**

```json
{
  "error": "AI usage limit reached",
  "limit": 25,
  "remaining": 0,
  "resetDate": "2025-11-19T00:00:00.000Z"
}
```

#### `/api/ai-usage/stats` (GET) - Admin Only

Get AI usage statistics for all users.

**Response:**

```json
{
  "stats": [
    {
      "email": "user@example.com",
      "usageCount": 5,
      "limit": 25,
      "resetDate": "2025-11-12T00:00:00.000Z"
    }
  ]
}
```

### 3. Admin Dashboard

The admin page now displays:

- User email
- Current usage count
- Weekly limit
- Remaining generations
- Next reset date
- Users at limit are highlighted in red

### 4. React Hook: `useAiUsage`

```typescript
import { useAiUsage } from '../hooks/use-ai-usage';

function MyComponent() {
  const { loading, error, usageStatus, checkUsage, trackUsage } = useAiUsage();

  // Check usage on mount
  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  // Track usage before AI generation
  const handleGenerate = async () => {
    try {
      await trackUsage();
      // Proceed with AI generation
    } catch (err) {
      // Handle limit reached or other errors
      console.error(err.message);
    }
  };

  return (
    <div>
      {usageStatus && (
        <p>Remaining: {usageStatus.remaining} / {usageStatus.limit}</p>
      )}
    </div>
  );
}
```

## Implementation Details

### Database Schema

The `users` collection includes:

```typescript
{
  aiUsageCount?: number;        // Current usage count
  aiUsageResetDate?: Date;      // Date when usage was last reset
  aiWeeklyLimit?: number;       // Weekly limit (default: 25)
}
```

### Weekly Reset Logic

- Reset occurs automatically when checking or tracking usage
- If `aiUsageResetDate` is more than 7 days old, the counter resets to 0 or 1
- Reset date is updated to the current date

## Integration Steps

To integrate AI usage tracking into your AI generation flow:

1. **Import the hook:**

```typescript
import { useAiUsage } from '../hooks/use-ai-usage';
```

2. **Check usage before generation:**

```typescript
const { trackUsage } = useAiUsage();

try {
  await trackUsage(); // This will throw if limit is reached
  // Proceed with AI generation
} catch (error) {
  // Show error to user
}
```

3. **Show remaining usage to user:**

```typescript
const { usageStatus, checkUsage } = useAiUsage();

useEffect(() => {
  checkUsage();
}, []);

// Display: usageStatus.remaining
```

## Cost Analysis

- GPT-5-mini pricing: $0.25/1M input tokens, $2.00/1M output tokens
- Estimated cost per generation: ~0.1-0.12 cents
- 25 generations per user per week: ~2.5-3 cents per user
- For 100 active users: ~$2.50-$3.00 per week
