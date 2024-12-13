# Loyalty Program Generator

A React application that generates loyalty program designs using OpenAI's GPT-4 model. This tool helps businesses create and iterate on customer loyalty programs with AI assistance.

## Features

- 🎯 Initial program generation based on business requirements
- 📊 Program analysis and recommendations
- 🔄 Improved version generation with AI feedback
- 📑 Tabbed interface to view all program versions
- 🔍 Detailed display of program components and features

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

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

- **Frontend**
  - React (UI library)
  - Vite (Build tool)
  - TailwindCSS (Styling)
  
- **Backend**
  - Express (API server)
  
- **AI Integration**
  - OpenAI API (using gpt-4-mini model)
  
- **Development**
  - Node.js (Runtime environment)

## Usage

1. Access the frontend at http://localhost:5173
2. Enter your business details and requirements
3. Generate initial loyalty program design
4. Review and analyze the generated program
5. Generate improved versions based on feedback
6. Compare different versions in the tabbed interface

## Development

To start development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your OpenAI API key
4. Start frontend: `npm run dev`
5. Start backend: `npm run server`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
