#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting setup...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    echo -n "Enter your OpenAI API key: "
    read apikey
    echo "VITE_OPENAI_API_KEY=$apikey" > .env
    echo -e "${GREEN}Created .env file${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}Dependencies installed${NC}"

# Create the start script
echo -e "${YELLOW}Creating start script...${NC}"
echo '#!/bin/bash
# Start both servers
echo "Starting development server..."
npm run dev & 
echo "Starting API server..."
node src/api/index.js &

# Store process IDs
DEV_PID=$!
API_PID=$!

# Function to kill both processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $DEV_PID
    kill $API_PID
    exit
}

# Set up trap
trap cleanup INT TERM

# Wait for either process to exit
wait $DEV_PID $API_PID' > start.sh

# Make scripts executable
chmod +x setup.sh start.sh

echo -e "${GREEN}Setup complete!${NC}"
echo -e "Run ${YELLOW}./start.sh${NC} to start the application"