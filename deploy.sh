#!/bin/bash

# Next.js Kanban Deployment Script
# Usage: ./deploy.sh [server_ip] [ssh_user]

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server_ip> <ssh_user> [ssh_key_path]"
    echo "Example: $0 192.168.1.100 ubuntu ~/.ssh/id_rsa"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2
SSH_KEY=${3:-~/.ssh/id_rsa}
REMOTE_PATH="/opt/nextjs-kanban"

echo "🚀 Deploying Next.js Kanban to $SERVER_IP"

# Create remote directory
echo "📁 Creating remote directory..."
ssh -i $SSH_KEY $SSH_USER@$SERVER_IP "sudo mkdir -p $REMOTE_PATH && sudo chown $SSH_USER:$SSH_USER $REMOTE_PATH"

# Copy files
echo "📦 Copying files to server..."
scp -i $SSH_KEY nextjs-kanban.tar $SSH_USER@$SERVER_IP:$REMOTE_PATH/
scp -i $SSH_KEY docker-compose.yml $SSH_USER@$SERVER_IP:$REMOTE_PATH/

# Execute deployment on server
echo "🐳 Loading Docker image and starting services..."
ssh -i $SSH_KEY $SSH_USER@$SERVER_IP << EOF
cd $REMOTE_PATH

# Load Docker image
echo "Loading Docker image..."
docker load < nextjs-kanban.tar

# Update docker-compose.yml with server IP
sed -i "s/your-server-ip/$SERVER_IP/g" docker-compose.yml

# Start services
echo "Starting services..."
docker-compose down || true
docker-compose up -d

# Wait for startup
echo "Waiting for application to start..."
sleep 10

# Check status
docker-compose ps
echo "✅ Deployment completed!"
echo "🌐 Application should be available at: http://$SERVER_IP:3000"
EOF

echo "🎉 Deployment finished! Check your application at http://$SERVER_IP:3000"