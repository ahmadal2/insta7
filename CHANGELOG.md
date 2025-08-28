# Changelog

All notable changes to this project will be documented in this file.

## [2025-08-28] - Fixes for Development Environment

### Fixed
- Resolved PowerShell execution policy issues on Windows that prevented `npm run dev` from working
- Fixed TypeScript errors in multiple files:
  - `src/lib/postActions.ts`: Fixed type incompatibilities in feed functions
  - `src/components/PostCard.tsx`: Fixed image style prop issues
  - `src/components/OptimizedImage.tsx`: Added missing props and proper typing
- Resolved React Compiler issues with Next.js 15 experimental features
- Improved error messages in `src/lib/supabaseClient.ts` for better developer experience
- Updated `.env.local` with clearer instructions
- Added comprehensive development guides and troubleshooting documentation

### Added
- `DEVELOPMENT_GUIDE.md`: Detailed instructions for setting up and running the development environment
- PowerShell execution policy fix instructions
- React Compiler troubleshooting information
- Better error handling and user guidance
- `SUPABASE_SCHEMA.sql`: Database setup SQL commands
- `SUPABASE_STORAGE.sql`: Storage setup SQL commands

### Changed
- Enhanced OptimizedImage component to accept aspectRatio and objectFit props
- Improved TypeScript type safety across the codebase
- Updated README.md with troubleshooting section for PowerShell and React Compiler issues
- Added database and storage setup instructions to README.md

## [Previous Versions]

This changelog was started after the initial implementation of the Instagram-like features.