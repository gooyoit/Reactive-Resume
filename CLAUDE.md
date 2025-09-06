# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup and Dependencies
- `pnpm install` - Install all dependencies using pnpm package manager
- `pnpm prisma:generate` - Generate Prisma client from schema
- `pnpm prisma:migrate:dev` - Run database migrations in development
- `pnpm prisma:migrate` - Deploy database migrations in production

### Development
- `pnpm dev` - Start both client and server in development mode (uses Nx to run multiple targets)
- `nx serve client` - Start only the React frontend (Vite dev server with HMR)
- `nx serve server` - Start only the NestJS backend
- `pnpm test` - Run all tests using Vitest
- `nx test client` - Run client tests only
- `nx test server` - Run server tests only (Jest)

### Code Quality
- `pnpm lint` - Run ESLint on all projects
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Check code formatting with Prettier
- `pnpm format:fix` - Format code with Prettier

### Build and Production
- `pnpm build` - Build all applications for production
- `nx build client` - Build only the React frontend
- `nx build server` - Build only the NestJS backend
- `pnpm start` - Start production server (requires prior build and migration)

### Internationalization
- `pnpm messages:extract` - Extract translatable strings using LinguiJS
- `pnpm crowdin:sync` - Sync translations with Crowdin (push changes and pull updates)

## Architecture Overview

### Project Structure
This is an Nx monorepo with the following main components:

**Applications (`apps/`):**
- `client/` - React frontend built with Vite, using React Router, TailwindCSS, and Radix UI
- `server/` - NestJS backend API with Prisma ORM, PostgreSQL database
- `artboard/` - Additional application component

**Libraries (`libs/`):**
- `dto/` - Shared data transfer objects and validation schemas (Zod)
- `ui/` - Shared UI components and design system
- `utils/` - Shared utility functions
- `hooks/` - Shared React hooks
- `parser/` - Resume parsing utilities
- `schema/` - Database and validation schemas

**Tools (`tools/`):**
- `prisma/` - Database schema and migrations
- `compose/` - Docker composition files

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling and development server
- TailwindCSS for styling with Radix UI components
- React Router v7 for routing
- TanStack Query for server state management
- Zustand for client state management
- React Hook Form with Zod validation
- Tiptap for rich text editing
- LinguiJS for internationalization

**Backend:**
- NestJS framework with TypeScript
- Prisma ORM with PostgreSQL database
- Passport.js for authentication (local, GitHub, Google, OpenID, WeChat)
- JWT tokens with refresh token rotation
- Nodemailer for email sending
- OpenAI integration for AI-powered features
- Minio for object storage
- Puppeteer for PDF generation

**WeChat Authentication:**
- Supports WeChat web login using OAuth 2.0
- Implementation follows WeChat Open Platform documentation (https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- Uses `passport-wechat` strategy for authentication flow
- Requires WeChat app registration and configuration of redirect URLs
- WeChat provider enum value added to Prisma schema

### Key Features
- Resume builder with drag-and-drop interface
- Multiple authentication providers including WeChat
- Real-time collaboration
- PDF export and preview generation
- Multi-language support (i18n)
- Template system with customizable layouts
- AI-powered content enhancement
- Public resume sharing with analytics

### Database
- PostgreSQL database with Prisma ORM
- Schema located at `tools/prisma/schema.prisma`
- Main entities: User, Resume, Secrets
- Support for multiple authentication providers including WeChat
- Resume data stored as JSON with versioning

### Development Workflow
1. Database changes require updating `tools/prisma/schema.prisma`
2. After schema changes, run `pnpm prisma:generate` to update client
3. Create migrations with `pnpm prisma:migrate:dev`
4. Frontend uses proxy configuration for API calls during development
5. Both frontend and backend support hot module replacement

### Testing
- Client: Vitest with React Testing Library
- Server: Jest with NestJS testing utilities
- Tests located in `*.spec.ts` and `*.test.ts` files
- Coverage reports generated in `coverage/` directory

### Important Notes
- Uses PNPM as package manager (not npm or yarn)
- Node.js version 22+ required
- All shared code should go in the `libs/` directory
- Follow existing patterns for new features (check similar components/services)
- Authentication supports multiple providers - check existing strategies before adding new ones
- PDF generation uses Puppeteer - be careful with memory usage
- Internationalization uses LinguiJS - extract messages after adding new translatable content