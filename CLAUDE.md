# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress Image Uploader tool - a full-stack web application that provides image upload and compression capabilities for WordPress sites. It uses React 18 + Vite for the frontend, Node.js + Express for the backend, and PostgreSQL (Neon) for database storage.

## Key Commands

### Development
```bash
# Install dependencies (run from project root)
npm install
cd server && npm install && cd ..

# Start development servers
npm start         # Runs both frontend (port 5173) and backend (port 3001) concurrently
npm run dev       # Frontend only (Vite dev server)
npm run server    # Backend only (Node.js server)

# Build production frontend
npm run build

# Database migrations
npm run migrate-domains      # Migrate domains from whitelist.js
npm run migrate-additional   # Additional domain migration
```

### Docker Operations
```bash
# Build Docker image (must be on dev branch)
docker build --platform linux/amd64 -t frankie0736/wp-image-uploader:latest .

# Push to Docker Hub
docker push frankie0736/wp-image-uploader:latest

# Quick deployment
./start.sh
```

### Linting
```bash
npm run lint  # Note: No .eslintrc configuration exists yet
```

## Architecture & Code Structure

### Branch Strategy
- **main branch**: Contains ONLY deployment files (docker-compose.yml, start.sh, README.md, .gitignore)
- **dev branch**: Contains full source code - ALL development work happens here
- Never push source code to main branch

### Frontend Architecture (src/)
- **React 18 + Vite**: Modern build tooling with hot module replacement
- **Ant Design**: UI component library
- **Zustand**: State management (configStore.js)
- **Key Components**:
  - `ImageUploader.jsx`: Main upload interface with drag-and-drop
  - `ImageList.jsx`: Displays uploaded images
  - `ConfigForm.jsx`: WordPress site configuration
  - `Settings.js`: Application settings interface

### Backend Architecture (server/)
- **Express.js**: RESTful API server
- **Sharp**: Image processing (compression, format conversion)
- **Multer**: File upload handling
- **PostgreSQL (Neon)**: Cloud database for domain whitelist
- **Services**:
  - `database.js`: PostgreSQL operations and table management
  - `domainService.js`: Domain whitelist CRUD operations
  - `uploadService.js`: Image upload and processing logic

### API Endpoints
- `GET /api/check-domain?domain=xxx` - Check if domain is authorized
- `POST /api/add-domain` - Add domain to whitelist (requires token)
- `GET /api/domains?token=xxx` - List all authorized domains
- `POST /api/upload` - Upload and process images
- `GET /health` - Health check endpoint

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon database)
- `WP_AUTH_TOKEN`: API authentication token for admin operations
- `PORT`: Server port (default: 3001)
- `MAX_FILE_SIZE`: Maximum upload size in MB (default: 10)
- `UPLOAD_DIR`: Upload directory path (default: ./uploads)
- `CORS_ORIGIN`: CORS configuration for frontend

### Deployment Workflow
1. All development on `dev` branch
2. Build Docker image from `dev` branch
3. Push image to Docker Hub
4. Sync deployment files to `main` branch if needed:
   ```bash
   git checkout main
   git checkout dev -- start.sh docker-compose.yml README.md .gitignore
   ```

### Important Technical Notes
- **ES Modules**: Both frontend and backend use ES module syntax
- **Sharp Dependencies**: Special handling in Dockerfile for binary compatibility
- **No Test Framework**: Currently no automated tests configured
- **Static Serving**: Backend serves both API and built React frontend
- **Database Auto-setup**: Tables are created automatically on server startup
- **Health Checks**: Docker container includes health check configuration

### Common Development Tasks
- When modifying image processing, check `server/services/uploadService.js`
- For WordPress API integration, see `src/services/wordpress.js`
- Domain management logic is in `server/services/domainService.js`
- Frontend state management uses Zustand in `src/store/configStore.js`
- All image processing uses Sharp library with WebP conversion support