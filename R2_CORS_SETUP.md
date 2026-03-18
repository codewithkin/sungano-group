# R2 CORS Configuration

Your R2 bucket needs CORS rules to allow uploads from your frontend. The "Network error during upload" happens because R2 is rejecting the cross-origin PUT request.

## Solution: Add CORS Rule via Wrangler

### 1. Install Wrangler (if not already installed)
```bash
npm install -g @cloudflare/wrangler
```

### 2. Create a `wrangler.toml` file in the project root
```toml
name = "sungano-group-r2"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "sungano-group"
account_id = "7b71f489541fe72763c158b881ed7ccb"
```

### 3. Create `scripts/r2-cors.js`
```javascript
// Configure CORS on R2 bucket
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: "https://7b71f489541fe72763c158b881ed7ccb.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "40693ed67c41b3b714c366ac1b184cf8",
    secretAccessKey: "4527839383236f5bc9aac414576db91ab792f46a43212eda2c84a2bf1fcf381b",
  },
});

const corsRules = {
  CORSRules: [
    {
      AllowedOrigins: ["http://localhost:3001", "https://yourdomain.com"],
      AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
      AllowedHeaders: ["*"],
      ExposeHeaders: ["Content-Length", "ETag"],
      MaxAgeSeconds: 3000,
    },
  ],
};

const command = new PutBucketCorsCommand({
  Bucket: "sungano-group",
  CORSConfiguration: corsRules,
});

client.send(command).then(() => {
  console.log("✅ CORS configured for R2 bucket");
}).catch((err) => {
  console.error("❌ Failed to configure CORS:", err);
});
```

### 4. Run the CORS setup
```bash
node scripts/r2-cors.js
```

## Alternative: Use Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **sungano-group** bucket
3. Click **Settings**
4. Scroll to **CORS Configuration**
5. Add this rule:
```json
{
  "AllowedOrigins": [
    "http://localhost:3001",
    "https://yourdomain.com"
  ],
  "AllowedMethods": [
    "GET",
    "PUT",
    "POST",
    "DELETE"
  ],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": [
    "Content-Length",
    "ETag"
  ],
  "MaxAgeSeconds": 3000
}
```

## Troubleshooting

If you still get "Network error during upload":

1. **Check browser console** - Look for CORS errors in DevTools
2. **Check R2 CORS** - Verify CORS rules are applied
3. **Check presign response** - Make sure the presigned URL is valid:
   ```javascript
   // In browser console during upload:
   // The fetch to /api/upload/presign should return:
   // { uploadUrl: "...", publicUrl: "...", key: "..." }
   ```
4. **Test with curl**:
   ```bash
   # Get a presigned URL from your server
   curl -X POST http://localhost:4000/api/upload/presign \
     -H "Content-Type: application/json" \
     -d '{"filename":"test.jpg","mimeType":"image/jpeg"}' \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Then test upload with the returned uploadUrl
   curl -X PUT "PRESIGNED_URL" \
     --data-binary @test.jpg \
     -H "Content-Type: image/jpeg"
   ```

## Your Current R2 Credentials (in .env)
```
R2_ACCOUNT_ID=7b71f489541fe72763c158b881ed7ccb
R2_PUBLIC_URL=https://pub-3f0498a6f6224687aad889a52254bfb9.r2.dev
```

Make sure to add CORS for `http://localhost:3001` (and production domain when deployed).
