# Next.js Kanban Internal Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on internal server
- PostgreSQL database accessible from the internal network
- SSH access to the internal server
- Internal network access to the server

## Required Information
Before deployment, gather these details:

### Server Access
- **Server IP/Hostname**: Internal IP address or hostname of your server
- **SSH Username**: Username for SSH access (e.g., `admin`, `ubuntu`, `root`)
- **SSH Password**: Password for SSH access, OR
- **SSH Key Path**: Path to your SSH private key (e.g., `~/.ssh/id_rsa`)

### Database Access
- **Database Host**: Internal IP/hostname of PostgreSQL server
- **Database Port**: Usually `5432` for PostgreSQL
- **Database Username**: Database user (e.g., `postgres`)
- **Database Password**: Database user password
- **Database Name**: Database name (e.g., `kanban`)

## Deployment Steps

### 1. Transfer Files to Internal Server
```bash
# Copy the Docker image and source code to your internal server
# Replace [SSH_USER] and [INTERNAL_SERVER] with your actual values
scp nextjs-kanban.tar pierre@uvir-pierre-sql:/opt/nextjs-kanban/
scp docker-compose.yml pierre@uvir-pierre-sql:/opt/nextjs-kanban/
```

### 2. Load Docker Image on Server
```bash
# SSH to your internal server
ssh pierre@uvir-pierre-sql

# Load the Docker image
docker load < nextjs-kanban.tar
```

### 3. Configure Environment Variables
Edit `docker-compose.yml` and update:
- `DATABASE_URL`: Update with your internal database connection details
- `AUTH_SECRET`: Use a secure random string
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**Note**: `NEXTAUTH_URL` is already set to `http://localhost:3000` for internal use.

### 4. Deploy the Application
```bash
# Start the application
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f nextjs-kanban
```

### 5. Access the Application
The application will be available at:
- **Internal URL**: `http://[INTERNAL_SERVER_IP]:3000`
- **Local access**: `http://localhost:3000` (from the server itself)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Internal application URL | `http://localhost:3000` |
| `AUTH_SECRET` | JWT secret for NextAuth | `your-secure-random-string` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db-server:5432/db` |
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

## Internal Network Considerations

### Database Access
- Ensure the PostgreSQL database is accessible from the internal server
- Use internal IP addresses or hostnames for database connections
- Configure firewall rules to allow database access

### User Access
- Users can access the application via `http://server-ip:3000`
- No SSL required for internal networks (unless your security policy requires it)
- Consider using internal DNS names for easier access

### Security Notes
- Since this is internal, focus on network-level security
- Use strong `AUTH_SECRET` values
- Regularly update the Docker images
- Monitor application logs for security events