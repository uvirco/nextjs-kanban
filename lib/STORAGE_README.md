# Storage Service

Abstraction layer for file storage that supports multiple backends.

## Supported Backends

- **Supabase Storage** (default) - Cloud storage via Supabase
- **Local Filesystem** - Store files on local disk

## Configuration

Add to your `.env`:

```bash
# Storage configuration
STORAGE_TYPE=supabase  # or 'local'

# For local storage only:
STORAGE_PATH=./storage/attachments  # Local filesystem path
STORAGE_BASE_URL=/api/storage       # Base URL for serving files
```

## Usage

```typescript
import { storage } from "@/lib/storage-service";

// Upload file
const buffer = Buffer.from(await file.arrayBuffer());
const { path, error } = await storage.upload("attachments/file.pdf", buffer, {
  contentType: "application/pdf",
});

// Delete file(s)
await storage.delete(["attachments/file.pdf"]);

// Get public URL
const url = storage.getPublicUrl("attachments/file.pdf");

// Check current backend
console.log(storage.getType()); // 'supabase' or 'local'
```

## Migration Path

### Current: Supabase Storage

```bash
STORAGE_TYPE=supabase
```

Files stored in Supabase Storage bucket.

### Future: Local Filesystem

```bash
STORAGE_TYPE=local
STORAGE_PATH=/var/app/storage
STORAGE_BASE_URL=/api/storage
```

Files stored in `/var/app/storage` on your server.
Served via `/api/storage/*` route with authentication.

### Hybrid Migration

Run both simultaneously:

1. Keep `STORAGE_TYPE=supabase` for existing files
2. New uploads can go to either backend
3. Gradually migrate old files:

   ```typescript
   // Download from Supabase
   const file = await downloadFromSupabase(path);

   // Upload to local
   await storage.upload(path, file);

   // Update database record
   await updateAttachmentPath(id, path);
   ```

## File Serving

### Supabase

- Public URLs generated via Supabase Storage API
- CDN-backed, globally distributed

### Local

- Files served via `/api/storage/[...path]` route
- Authenticated access required
- Consider adding nginx/CDN layer for production

## Benefits

✅ **Zero code changes** - Switch backends with env var  
✅ **Easy testing** - Test locally without Supabase  
✅ **Cost control** - Move to cheaper storage  
✅ **Data sovereignty** - Keep files on-premise  
✅ **Gradual migration** - No downtime required

## Production Setup

### Local Storage + Nginx

```nginx
# Serve static files directly from nginx
location /storage/ {
    alias /var/app/storage/;
    expires 1h;
    add_header Cache-Control "public";
}
```

### Local Storage + CloudFront

1. Set up CloudFront distribution
2. Point origin to your server
3. Update `STORAGE_BASE_URL=https://cdn.example.com`
