#!/bin/bash

# Next.js Kanban Internal Deployment Script
# Usage: ./deploy.sh [internal_server_ip] [ssh_user]

set -e

DRY_RUN=0

# support optional dry-run flag: ./deploy.sh --dry-run [server] [user] [key]
if [ "$1" = "--dry-run" ] || [ "$1" = "-n" ]; then
    DRY_RUN=1
    shift
fi

# default to the internal server and user you gave me so it's easy to test
# you can still pass a different server/user/key on the command-line
SERVER_IP=${1:-uvir-pierre-sql}
SSH_USER=${2:-pierre}
SSH_KEY=${3:-~/.ssh/id_rsa}
REMOTE_PATH="/opt/nextjs-kanban"

echo "🚀 Deploying Next.js Kanban to internal server $SERVER_IP (ssh user: $SSH_USER)"

# Create remote directory
echo "📁 Creating remote directory..."
SSH_CMD="ssh -i $SSH_KEY $SSH_USER@$SERVER_IP"
SCP_CMD="scp -i $SSH_KEY"

if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] Would run: $SSH_CMD 'sudo mkdir -p $REMOTE_PATH && sudo chown $SSH_USER:$SSH_USER $REMOTE_PATH'"
else
    $SSH_CMD "sudo mkdir -p $REMOTE_PATH && sudo chown $SSH_USER:$SSH_USER $REMOTE_PATH"
fi

# Copy files
echo "📦 Copying files to internal server..."
if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] Would run: $SCP_CMD nextjs-kanban.tar $SSH_USER@$SERVER_IP:$REMOTE_PATH/"
    echo "[dry-run] Would run: $SCP_CMD docker-compose.yml $SSH_USER@$SERVER_IP:$REMOTE_PATH/"
else
    $SCP_CMD nextjs-kanban.tar $SSH_USER@$SERVER_IP:$REMOTE_PATH/
    $SCP_CMD docker-compose.yml $SSH_USER@$SERVER_IP:$REMOTE_PATH/
fi

# Execute deployment on server
echo "🐳 Loading Docker image and starting services..."
if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] Would SSH to server and run deployment steps (loading image / docker-compose up -d)"
else
    $SSH_CMD << EOF
cd $REMOTE_PATH

# Load Docker image
echo "Loading Docker image..."
docker load < nextjs-kanban.tar

# Note: NEXTAUTH_URL is already set to localhost:3000 for internal use
# Only need to update DATABASE_URL if different from default

# Start services
echo "Starting services..."
docker-compose down || true
docker-compose up -d

# Wait for startup
echo "Waiting for application to start..."
sleep 10

# Check status
docker-compose ps
echo "✅ Internal deployment completed!"
echo "🌐 Application available at: http://$SERVER_IP:3000"
echo "🏠 Local access (on server): http://localhost:3000"
EOF

fi

if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] Finished — nothing executed. To run for real, re-run without --dry-run (or pass explicit server/user/key)."
else
    echo "🎉 Internal deployment finished!"
    echo "📍 Access your application at: http://$SERVER_IP:3000"
fi