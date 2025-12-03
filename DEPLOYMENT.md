# Next.js Kanban Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on target server
- PostgreSQL database accessible from the server
- Domain name or IP address for the server

## Deployment Steps

### 1. Transfer Files to Server
```bash
# Copy the Docker image and source code to your server
scp nextjs-kanban.tar user@your-server:/path/to/app/
scp docker-compose.yml user@your-server:/path/to/app/
```

### 2. Load Docker Image on Server
```bash
# SSH to your server
ssh user@your-server

# Load the Docker image
docker load < nextjs-kanban.tar
```

### 3. Configure Environment Variables
Edit `docker-compose.yml` and update:
- `NEXTAUTH_URL`: Change `your-server-ip` to your actual server IP/domain
- `DATABASE_URL`: Update with your database connection details
- `AUTH_SECRET`: Use a secure random string in production
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 4. Deploy the Application
```bash
# Start the application
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f nextjs-kanban
```

### 5. Configure Reverse Proxy (Optional but Recommended)
For production, set up Nginx or Apache as a reverse proxy:

```nginx
# /etc/nginx/sites-available/nextjs-kanban
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL Certificate (Production)
```bash
# Install certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Full URL of your application | `https://your-domain.com` |
| `AUTH_SECRET` | JWT secret for NextAuth | `your-secure-random-string` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |

## Troubleshooting

### Check Application Logs
```bash
docker-compose logs -f nextjs-kanban
```

### Check Application Health
```bash
curl http://localhost:3000
```

### Restart Application
```bash
docker-compose restart nextjs-kanban
```

### Update Application
```bash
# Stop the application
docker-compose down

# Load new image
docker load < new-nextjs-kanban.tar

# Start again
docker-compose up -d
```