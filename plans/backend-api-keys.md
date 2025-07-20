# API Key Management - Not Implemented

## Current Status

No backend implementation for API key management. The api_keys Django app exists with migrations only - no models, views, or functionality.

## Frontend State

### ApiKeysPage
- Basic page exists with placeholder content
- Shows "API Keys" heading only
- No functionality implemented

### TopBar Button
- "Get API key" button exists in TopBar
- No modal or implementation when clicked
- Button is visual only

## Not Implemented

### Backend
1. No API key models
2. No generation endpoints
3. No authentication via API keys
4. No key storage or hashing
5. No key management views

### Frontend
1. No modal for key generation
2. No key display or copying
3. No key listing interface
4. No key revocation UI
5. Button clicks have no effect

## Directory Structure

```
api_keys/
├── __init__.py
├── migrations/
│   ├── __init__.py
│   └── 0001_initial.py  # Empty migration
```

## Potential Future Implementation

If implemented, would likely include:

### Endpoints
```
POST /api/keys/          # Generate new key
GET  /api/keys/          # List user's keys
DELETE /api/keys/{id}/   # Revoke key
```

### Security Requirements
- Keys hashed before storage
- Keys shown only once on generation
- Prefix visible for identification
- Rate limiting on generation
- Secure random generation

### Frontend Requirements
- Modal for key generation
- Copy-to-clipboard functionality
- Key listing with last used dates
- Revocation confirmations
- Usage instructions

## Current Authentication

The application currently uses:
- JWT tokens for authentication
- Bearer token format
- Google OAuth for login
- No API key support

## Use Cases Not Supported

Without API keys, users cannot:
1. Access the API programmatically
2. Integrate with external tools
3. Build custom applications
4. Use CI/CD pipelines
5. Create automated workflows

The feature remains a UI placeholder only. 