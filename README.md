# HireMate: AI-Powered Job Preparation Platform

## Project Overview

HireMate is a comprehensive web application that leverages artificial intelligence to help job seekers prepare for interviews, optimize their resumes, and practice technical coding problems. The platform provides AI-driven interview simulations, resume analysis, personalized question generation, and an integrated coding practice environment with live code execution.

### Key Features

1. **AI Interview Practice** - Real-time voice-based interview simulations with AI-powered feedback
2. **Resume Analysis & Optimization** - AI-driven resume review with ATS compatibility scoring
3. **Personalized Question Generation** - Job-specific interview questions generated using AI
4. **Coding Problems Practice** - Interactive coding challenges with live code execution and test case validation
5. **Application Materials Suggestions** - Tailored recommendations for resume, cover letter, and LinkedIn optimization
6. **Resume Version Management** - Track and manage multiple resume iterations

---

## Technical Architecture

### Technology Stack

- **Frontend Framework**: Next.js 15.4.2 (React 18.3.1)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Drizzle ORM 0.44.3
- **Authentication**: Clerk 6.26.0
- **AI Services**: 
  - Google Gemini 2.5 Flash (via @ai-sdk/google)
  - Hume AI Voice SDK 0.2.6
- **Code Execution**: Isolated VM for secure JavaScript/TypeScript execution
- **UI Components**: Radix UI primitives, Tailwind CSS 4, shadcn/ui
- **Rate Limiting & Security**: Arcjet Next.js
- **File Processing**: Mammoth (for DOCX), PDF.js (for PDFs)

### System Architecture

The application follows a **feature-based architecture** pattern:

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── features/               # Feature modules (interviews, problems, jobInfos, etc.)
├── services/               # External service integrations (AI, auth, etc.)
├── drizzle/                # Database schema and migrations
├── lib/                    # Utility functions
└── data/                   # Environment configuration
```

---

## Project Implementation Summary

### Core Features Implemented

#### 1. AI-Powered Interview Practice
- Integration with Hume AI Voice SDK for real-time voice conversations
- AI-generated interview feedback with detailed scorecards
- Question extraction and analysis from interview transcripts
- Performance metrics visualization (radar charts, gauge charts)

#### 2. Resume Analysis System
- File upload support (PDF, DOCX)
- AI-powered analysis using Gemini 2.5 Flash
- Multi-dimensional scoring:
  - ATS Compatibility
  - Job Match Analysis
  - Writing & Formatting Quality
  - Keyword Coverage
- Structured feedback with actionable recommendations

#### 3. Coding Problems Feature
- AI-generated coding problems tailored to job descriptions
- Difficulty levels: Easy, Medium, Hard
- Monaco Editor integration for code editing
- Live code execution with test case validation
- Support for JavaScript and TypeScript
- Problem templates and reference solutions

#### 4. Application Materials Optimization
- AI-generated suggestions for:
  - Resume bullet points
  - Keywords to add
  - Cover letter points
  - LinkedIn profile optimization

#### 5. Database Design
- PostgreSQL database with 9 schema tables
- Feature-based organization
- JSONB columns for flexible data structures
- Comprehensive migration history

---

## What We Added to Existing Reusable Software

This project was initially built following the **AI-Powered Job Prep tutorial by webdev-simplify**. We acknowledge this foundation and have significantly extended it with original features:

### Original Additions by Our Team

1. **Coding Problems System** (100% Original)
   - Complete database schema (`problem.ts`, `testCase.ts`, `submission.ts`)
   - Code execution service using `isolated-vm`
   - Monaco Editor integration
   - AI-powered problem generation tailored to job descriptions
   - Test case validation system
   - Problem difficulty selection and templates

2. **Application Materials Feature** (100% Original)
   - New schema table for application materials
   - AI service for generating application suggestions
   - Integration with job info system

3. **Resume Version Management** (100% Original)
   - Resume versioning schema and database operations
   - Version tracking functionality

4. **Enhanced Interview Analytics** (Original Improvements)
   - Upgraded interview feedback structure from `varchar` to `jsonb`
   - Added scorecard and questions tracking
   - Advanced visualization components (RadarChart, OverallScore, PerformanceMetrics)

5. **Code Execution Service** (100% Original)
   - Secure JavaScript/TypeScript code execution
   - Test case parsing and validation
   - Error handling and output formatting

6. **Additional UI Components** (Original)
   - Interview analytics dashboard
   - Coding problem solver interface
   - Enhanced job info sidebar
   - Application materials client interface

### Modifications to Base Code

- Enhanced interview schema with JSONB fields for structured data
- Improved database migrations (8+ migration files vs 1 in tutorial)
- Additional dependencies for code execution and advanced UI features
- Extended AI services for problem generation and application materials

### Tutorial Base (Acknowledged)

The following features were initially implemented following the tutorial:
- Core authentication flow (Clerk integration)
- Basic interview practice functionality
- Job info management system
- Question generation service
- Resume analysis foundation
- Base UI components and layout

**Note**: While the core structure follows the tutorial, all new features, enhancements, and the coding problems system are original implementations by our team.

---

## AI Techniques & Models Used

### 1. Google Gemini 2.5 Flash
- **Purpose**: Primary AI model for all text generation tasks
- **Use Cases**:
  - Interview question generation
  - Resume analysis and scoring
  - Coding problem generation
  - Application materials suggestions
  - Job description analysis
- **Integration**: Via `@ai-sdk/google` package
- **Model Selection**: Chose Flash model for cost-effectiveness and speed

### 2. Structured Output Generation
- **Technique**: `streamObject` and `generateObject` with Zod schemas
- **Purpose**: Type-safe, structured AI responses
- **Benefits**: 
  - Eliminates parsing errors
  - Runtime validation
  - TypeScript type inference

### 3. AI Streaming
- **Technique**: Streaming AI responses for progressive rendering
- **Purpose**: Improve user experience for long-running operations
- **Implementation**: Using `streamText` and `streamObject` from Vercel AI SDK

### 4. Prompt Engineering
- **Token Optimization**: Truncating long inputs (job descriptions) to reduce costs
- **Context Management**: Including relevant context while avoiding redundancy
- **System Prompts**: Detailed system prompts for consistent AI behavior

### 5. Hume AI Voice SDK
- **Purpose**: Real-time voice-based interview conversations
- **Integration**: `@humeai/voice-react` package
- **Features**: 
  - Voice-to-voice AI conversations
  - Real-time transcription
  - Emotion detection and analysis

---

## Open Source Libraries & Dependencies

### Core Framework & Runtime
- **Next.js 15.4.2** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety

### AI & Machine Learning
- **@ai-sdk/google (^1.2.22)** - Google Gemini AI SDK
- **@ai-sdk/react (^1.2.12)** - React hooks for AI
- **ai (^4.3.19)** - Vercel AI SDK
- **hume (^0.12.1)** - Hume AI SDK
- **@humeai/voice-react (^0.2.6)** - Hume Voice React integration

### Database & ORM
- **drizzle-orm (^0.44.3)** - TypeScript ORM
- **drizzle-kit (^0.31.4)** - Database migrations
- **pg (^8.16.3)** - PostgreSQL client

### Authentication & Security
- **@clerk/nextjs (^6.26.0)** - Authentication service
- **@arcjet/next (^1.0.0-beta.9)** - Rate limiting and bot detection
- **svix (^1.81.0)** - Webhook verification

### UI Components & Styling
- **@radix-ui/** - Accessible UI primitives (accordion, dialog, dropdown-menu, etc.)
- **tailwindcss (^4)** - CSS framework
- **lucide-react (^0.525.0)** - Icon library
- **@monaco-editor/react (^4.7.0)** - Code editor
- **react-gauge-chart (^0.5.1)** - Gauge chart visualization
- **react-resizable-panels (^3.0.3)** - Resizable panel layouts

### Form Handling & Validation
- **react-hook-form (^7.61.1)** - Form state management
- **zod (^3.25.76)** - Schema validation
- **@hookform/resolvers (^5.1.1)** - Form validation integration
- **zod-to-json-schema (^3.24.6)** - Schema conversion

### Code Execution
- **isolated-vm (^6.0.2)** - Secure JavaScript code execution

### File Processing
- **mammoth (^1.11.0)** - DOCX to HTML conversion

### Utilities
- **lodash (^4.17.21)** - Utility functions
- **clsx (^2.1.1)** - Conditional class names
- **tailwind-merge (^3.3.1)** - Tailwind class merging
- **@paralleldrive/cuid2 (^3.0.4)** - Unique ID generation

---

## What We Have Learned from This Project

### 1. AI Integration & Token Management
- **Token Optimization**: Learned to truncate long inputs before sending to AI to reduce costs significantly
- **Streaming Responses**: Discovered that streaming makes long operations feel instant, improving UX dramatically
- **Structured Outputs**: Using `streamObject` with Zod schemas provides type-safe, reliable AI responses
- **Model Selection**: Choosing the right model (Gemini Flash for most tasks) balances cost and performance

### 2. Production-Ready AI Applications
- **Multiple Rate Limiting Layers**: Implemented global, feature-level, and concurrency controls
- **Exponential Backoff with Jitter**: Prevents thundering herd problems when APIs are overloaded
- **Error Classification**: Distinguishing retryable vs non-retryable errors is crucial
- **Cost Management**: Caching AI results and truncating inputs significantly reduces expenses

### 3. Database Design Patterns
- **Drizzle ORM**: Provides end-to-end TypeScript type safety from schema to queries
- **JSONB for Flexible Data**: Using JSONB for frequently-changing structures (interview feedback) instead of over-normalizing
- **Feature-Based Organization**: Organizing database operations by feature improves maintainability

### 4. Architecture & Code Organization
- **Feature-Based Architecture**: Organizing by feature (interviews, problems) rather than by layer makes code easier to navigate
- **Server Actions**: Next.js Server Actions are simpler and more type-safe than API routes for mutations
- **Separation of Concerns**: Keeping services (AI, auth) separate from business logic improves testability

### 5. User Experience Design
- **Progressive Enhancement**: Showing partial results as they stream improves perceived performance
- **Clear Error States**: Distinguishing between plan limits, rate limits, and permissions helps users understand issues
- **Loading States**: Proper skeleton screens and loading indicators maintain user engagement

### 6. Security & Performance
- **Bot Detection**: Arcjet's bot detection prevents automated abuse
- **Resource-Level Authorization**: Checking resource ownership prevents unauthorized access
- **Caching Strategy**: Next.js cache tags with hierarchical invalidation optimizes performance

### 7. Code Execution & Safety
- **Secure Code Execution**: Implemented safe JavaScript execution using Function constructor with controlled scopes
- **Test Case Validation**: Built robust test case parsing and comparison logic
- **Error Handling**: Comprehensive error handling for code execution edge cases

### 8. Type Safety & Validation
- **End-to-End Type Safety**: TypeScript + Zod + Drizzle provides compile-time and runtime safety
- **Runtime Validation**: Zod schemas catch data errors before they reach the database
- **Type Inference**: Leveraging TypeScript inference reduces boilerplate

### 9. Real-World Challenges
- **API Rate Limits**: Learned to implement sophisticated retry and backoff strategies
- **Cost Management**: Balancing feature richness with AI API costs requires careful optimization
- **User Feedback**: Streaming and progressive rendering are essential for long-running AI operations

### 10. Team Collaboration & Project Management
- **Feature Development**: Adding major features (coding problems) required careful database design
- **Migration Strategy**: Managing database migrations as features evolve
- **Code Reusability**: Building reusable components and services accelerates development

---

## Project Structure

```
├── src/
│   ├── app/                          # Next.js pages and layouts
│   │   ├── api/                      # API routes
│   │   │   ├── ai/                   # AI-related endpoints
│   │   │   ├── problems/             # Coding problem endpoints
│   │   │   └── webhooks/             # Webhook handlers
│   │   ├── app/                      # Main application pages
│   │   │   └── job-infos/            # Job-specific features
│   │   └── onboarding/               # User onboarding flow
│   ├── components/                   # Reusable UI components
│   │   ├── interviews/               # Interview-specific components
│   │   └── ui/                       # Base UI components (shadcn/ui)
│   ├── features/                     # Feature modules
│   │   ├── interviews/               # Interview functionality
│   │   ├── problems/                 # Coding problems feature
│   │   ├── jobInfos/                 # Job info management
│   │   ├── questions/                # Question generation
│   │   └── resumeAnalyses/           # Resume analysis
│   ├── services/                     # External service integrations
│   │   ├── ai/                       # AI service implementations
│   │   ├── clerk/                    # Authentication
│   │   ├── codeExecution/            # Code execution engine
│   │   └── hume/                     # Hume AI voice integration
│   ├── drizzle/                      # Database schema and migrations
│   │   ├── schema/                   # Table definitions
│   │   └── migrations/               # Database migration files
│   └── lib/                          # Utility functions
├── public/                           # Static assets
└── scripts/                          # Utility scripts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account (for authentication)
- Google Gemini API key
- Hume AI account (for voice interviews)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ai-powered-job-prep
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Fill in your API keys and database credentials
```

4. Set up database
```bash
npm run db:push
# or
npm run db:migrate
```

5. Run development server
```bash
npm run dev
```

---

## GitHub Repository

**Repository URL**: [To be updated with your GitHub repository link]

**Note**: Please update this section with your actual GitHub repository URL before submission.

---

## References & Credits

### Tutorial & Base Code
- **WebDevSimplified Tutorial**: Initial project structure and core features based on "AI-Powered Job Prep" tutorial by webdev-simplify
  - License: MIT
  - Base repository: `ai-powered-job-prep-by-webdev-simplify`

### AI Services & Models
- **Google Gemini 2.5 Flash**: AI model for text generation, analysis, and problem generation
  - Documentation: https://ai.google.dev/
  - SDK: @ai-sdk/google

- **Hume AI Voice SDK**: Voice-based interview conversations
  - Documentation: https://www.hume.ai/
  - SDK: @humeai/voice-react

### Open Source Libraries
- **Next.js**: React framework - https://nextjs.org/
- **Drizzle ORM**: TypeScript ORM - https://orm.drizzle.team/
- **Clerk**: Authentication service - https://clerk.com/
- **Vercel AI SDK**: AI integration SDK - https://sdk.vercel.ai/
- **Monaco Editor**: Code editor - https://microsoft.github.io/monaco-editor/
- **Radix UI**: Accessible UI primitives - https://www.radix-ui.com/
- **shadcn/ui**: UI component library - https://ui.shadcn.com/

### Documentation & Resources
- Next.js Documentation: https://nextjs.org/docs
- Drizzle ORM Documentation: https://orm.drizzle.team/docs/overview
- Vercel AI SDK Documentation: https://sdk.vercel.ai/docs
- TypeScript Documentation: https://www.typescriptlang.org/docs/

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Team Members

[To be updated with your team members' names]

---

## Submission Information

- **Project Name**: HireMate - AI-Powered Job Preparation Platform
- **Submission Date**: November 19, 2025
- **Course**: [Course Name]
- **Instructor**: [Instructor Name]

---

## Additional Notes

This project demonstrates the integration of multiple AI services, secure code execution, and a comprehensive feature set for job preparation. The codebase includes significant original contributions beyond the tutorial foundation, particularly in the coding problems system, application materials feature, and enhanced interview analytics.

**Code Freeze Date**: November 19, 2025, 11:59 PM
