# Loyalty Program Generator

A React application that generates loyalty program designs using OpenAI's GPT-4 model. This tool helps businesses create and iterate on customer loyalty programs with AI assistance.

## Features

- Initial program generation based on business requirements
- Program analysis and recommendations
- Improved version generation with AI feedback
- Tabbed interface to view all program versions
- Detailed display of program components and features

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Git
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/fsilva7456/loyalty-program-generator.git
cd loyalty-program-generator
```

2. Run the setup script:
```bash
setup.bat
```
This script will:
- Prompt for your OpenAI API key
- Install all required dependencies
- Create the start script

3. Start the application:
```bash
start.bat
```
This will launch:
- Vite development server (Frontend) at http://localhost:5173
- Express API server (Backend) at http://localhost:3001

## Project Structure

```
loyalty-program-generator/
├── src/
│   ├── api/
│   │   ├── index.js     # API server
│   │   └── generate.js  # OpenAI integration
│   ├── App.jsx         # Main React component
│   ├── main.jsx       # React entry point
│   └── index.css      # Styles
├── setup.bat          # Setup script
├── start.bat         # Start script
├── package.json      # Dependencies
└── .env             # API key (created during setup)
```

## Technology Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Express
- AI: OpenAI API (using gpt-4-mini model)
- Development: Node.js

## Development

To start development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your OpenAI API key
4. Start frontend: `npm run dev`
5. Start backend: `npm run server`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request