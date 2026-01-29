# AI Storytelling App - Frontend

A React Native application built with Expo for creating AI-powered children's stories. This is the **frontend-only** implementation with dark mode support, multi-language capabilities, and cross-platform compatibility (iOS, Android, Web).

## 🚀 Features

### Core Features
- **Story Generation**: Create personalized stories with AI
- **Story Library**: Browse, search, and manage saved stories
- **Audio Narration**: Full audio playback with controls
- **Offline Support**: Download stories for offline reading
- **Multi-language**: English, French, Arabic with RTL support
- **Dark Mode Only**: Child-friendly dark theme

### Technical Features
- **Cross-platform**: iOS, Android, and Web support
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Screen reader support, font scaling
- **Offline Storage**: Local caching and storage management
- **Secure Authentication**: Token-based auth with secure storage

## 🛠 Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **API Client**: Axios
- **Audio**: Expo AV
- **Storage**: Expo SecureStore, AsyncStorage
- **Internationalization**: react-i18next
- **Icons**: Expo Vector Icons

## 📱 Supported Platforms

- iOS (iPhone, iPad)
- Android (Phone, Tablet)
- Web (Responsive)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-storytelling-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on specific platforms**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── audio/          # Audio-related components
│   └── story/          # Story-specific components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home/dashboard screens
│   ├── story/          # Story-related screens
│   └── settings/       # Settings screens
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── theme/              # Theme configuration
└── i18n/               # Internationalization
    └── locales/        # Translation files

app/                    # Expo Router pages
├── (tabs)/             # Tab navigation
├── auth/               # Authentication routes
├── story/              # Story routes
└── _layout.tsx         # Root layout
```

## 🌐 API Integration

This frontend communicates with a separate backend API. The API service layer is abstracted in `src/services/`:

- `apiClient.ts` - HTTP client configuration
- `authService.ts` - Authentication endpoints
- `storyService.ts` - Story-related endpoints
- `offlineStorageService.ts` - Local storage management

### API Configuration

Update your `.env` file with the backend API URL:

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 🌍 Internationalization

The app supports multiple languages with RTL support:

- **English** (en) - LTR
- **French** (fr) - LTR  
- **Arabic** (ar) - RTL

Translation files are located in `src/i18n/locales/`.

## 🎨 Theming

The app uses a dark-only theme defined in `src/theme/index.ts`. The theme includes:

- Color palette optimized for dark mode
- Typography scales
- Spacing system
- Border radius values
- Shadow definitions

## 📱 Platform-Specific Features

### iOS
- Apple Sign-In integration ready
- Native navigation feel
- iOS-specific UI adaptations

### Android
- Material Design elements
- Android-specific UI adaptations
- Adaptive icons

### Web
- Responsive layout
- Keyboard navigation
- Web-compatible audio playback
- Progressive Web App ready

## 🔒 Security

- Secure token storage using Expo SecureStore
- API request/response interceptors
- Automatic token refresh
- Input validation and sanitization

## 📦 Building for Production

### Development Build
```bash
expo build:ios
expo build:android
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for all platforms
eas build --platform all
```

### Web Build
```bash
expo export:web
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting
npx eslint src/
```

## 📈 Performance Optimization

- Image optimization and caching
- Audio file caching for offline playback
- Lazy loading of screens
- Efficient list rendering with FlatList
- Memory management for audio playback

## 🔧 Configuration

### Expo Configuration
Main configuration is in `app.json`:
- App metadata
- Platform-specific settings
- Plugin configurations
- Asset bundling

### TypeScript Configuration
Path aliases are configured in `tsconfig.json` for clean imports:
```typescript
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';
```

## 🚨 Important Notes

- This is a **frontend-only** project
- Backend API must be implemented separately
- No API keys or secrets should be committed
- All backend communication goes through service abstractions
- Dark mode is the only supported theme

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

[Add support contact information here]