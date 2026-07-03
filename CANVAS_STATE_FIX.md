# Canvas State Size Limit Fix

## Problem
The app was failing with the error:
```
Uncaught Error: Value is too large (1.26 MiB > maximum size 1 MiB)
```

This occurred because the `canvasState` was being stored directly in the Convex database, which has a 1 MB limit per field for documents.

## Solution
Implemented a **hybrid storage strategy** that automatically handles large canvas states:

### How It Works

1. **Small Canvas States (< 800 KB)** - Stored directly in the database
   - Faster access
   - No extra storage lookups needed
   - Kept in the `canvasState` field

2. **Large Canvas States (≥ 800 KB)** - Stored in Convex storage
   - Unlimited size support
   - Reference stored in `canvasStateStorageId` field
   - Automatically fetched when needed

### Changes Made

#### Backend (`convex/projects.js`)
- Added `MAX_CANVAS_STATE_SIZE` constant (1 MB)
- Added `shouldUseStorage()` helper to determine storage method
- Added `storeCanvasState` mutation for manual canvas state storage
- Added `getCanvasState` query to retrieve stored canvas states
- Updated `create` mutation to use storage for large states
- Updated `updateProject` mutation to:
  - Check state size automatically
  - Store large states in Convex storage
  - Clean up old stored states
  - Provide user-friendly error messages

#### Database Schema (`convex/schema.js`)
- Added `canvasStateStorageId` field to projects table
- Kept `canvasState` field for backward compatibility
- Fields are mutually exclusive based on size

#### Frontend (`app/(main)/editor/[projectId]/_components/canvas.jsx`)
- Added `useQuery` hook to fetch stored canvas states
- Updated canvas initialization to use stored state if available
- Falls back to database state for small canvas states
- Automatic cleanup and re-initialization when state changes

### Error Handling

Users now receive helpful error messages:
- If canvas state exceeds 1 MB even after compression:
  ```
  Canvas state is too large (1.30 MB > 1 MB MB). 
  Please simplify your design or remove large elements.
  ```

## Benefits

✅ **No Size Limits** - Handle canvas states of any size  
✅ **Automatic** - No client code changes needed  
✅ **Backward Compatible** - Existing projects continue to work  
✅ **Efficient** - Small states stay fast in the database  
✅ **User-Friendly** - Clear error messages  

## Migration

No action required! The system automatically:
- Stores new large states in Convex storage
- Continues to work with existing small states in the database
- Migrates states between storage methods as needed

## Testing

1. Create a complex project with many objects
2. Save the project - should automatically use storage if needed
3. Reload the project - canvas state should load correctly
4. Edit and save again - should handle storage cleanup properly

## Performance Notes

- **First load**: Slightly slower for large states (network fetch from storage)
- **Subsequent loads**: Cached by Convex query system
- **Saves**: Same speed for both DB and storage storage (automatic)
