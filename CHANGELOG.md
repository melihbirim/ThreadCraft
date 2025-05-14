# Changelog

## [0.1.0] - 2024-05-14

### Added
- OAuth2.0 authentication with X (Twitter)
- Real-time thread preview with X-style formatting
- Auto-expanding text editor with character limits
- Image upload and preview functionality
- Smart thread splitting algorithm
- Two-column responsive layout
- User profile integration

### Components
- Header with authentication controls
- Thread editor with auto-height adjustment
- Live thread preview with image support
- Publishing modal with status feedback

### Technical
- NextAuth.js session management
- TypeScript implementation
- Tailwind CSS styling
- Component modularization
- Error handling and feedback

### Known Limitations
- No scheduled posting
- No draft saving
- No thread analytics

### Planned
- Thread drafts & templates
- Scheduled posting
- Analytics dashboard

## [0.2.0] - 2024-05-15

### Added
- XAI Integration with Grok models
- Local storage for API key persistence
- Draft saving functionality
- Loading states and improved error handling
- Enhanced AI content generation

### Changed
- Migrated from OpenAI to XAI SDK (@ai-sdk/xai)
- Improved thread formatting and content guidelines
- Enhanced UI/UX with loading spinners and toast notifications
- Updated API key management system

### Fixed
- Error handling in AI generation
- Loading state visualization
- Thread formatting consistency

### Removed
- OpenAI integration
- Thread count markers (1/, 🧵)
- Unsupported 'reasoning_effort' parameter 