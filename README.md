# Katsina State Government Memo Management App

A React Native Expo application for the Katsina State Government to manage and review memos from various ministries. The app provides a WhatsApp-like interface for easy navigation and memo management.

## Features

### 📱 Main Features
- **Ministry List**: WhatsApp-style interface showing all ministries with unread memo counts
- **Memo Management**: View, approve, reject, request details, or leave memos pending
- **History Tracking**: Complete history of all actions taken on memos
- **Settings**: App configuration and data management options

### 🎨 Design
- **Minimalistic UI**: Clean, modern interface with white and green color scheme
- **Responsive Design**: Optimized for all device sizes (Android and iOS)
- **WhatsApp-like Interface**: Familiar chat-style navigation for easy use
- **Notification Badges**: Visual indicators for unread memos

### 🔧 Technical Features
- **Local Storage**: AsyncStorage for data persistence
- **TypeScript**: Full type safety throughout the application
- **React Navigation**: Bottom tab navigation with stack navigation
- **Real-time Updates**: Automatic refresh and data synchronization

## Installation

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm or yarn
   - Expo CLI (`npm install -g @expo/cli`)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For Web: `npm run web`

## App Structure

### Screens
- **Memos**: Main screen showing ministries in WhatsApp-style list
- **Memo Detail**: Individual memo view with action buttons
- **Histories**: Complete history of all memo actions
- **Settings**: App configuration and data management

### Data Models
- **Ministry**: Contains ministry information and unread counts
- **Memo**: Individual memo with title, content, status, and priority
- **MemoAction**: Tracks all actions taken on memos

### Services
- **DataService**: Handles all data operations with AsyncStorage

## Usage

### Viewing Memos
1. Open the app to see the main memos screen
2. Ministries are displayed like WhatsApp chats
3. Unread memo counts are shown as badges
4. Tap on a ministry to view its memos

### Managing Memos
1. Tap on a memo to open the action modal
2. Choose from available actions:
   - **Approve**: Approve the memo
   - **Reject**: Reject the memo
   - **Request Details**: Request more information
   - **Leave Pending**: Keep the memo pending
3. Add optional comments
4. Confirm your action

### Viewing History
1. Navigate to the "Histories" tab
2. Filter actions by status (All, Approved, Rejected, Requested)
3. View complete history of all memo actions

### Settings
1. Navigate to the "Settings" tab
2. Configure app preferences
3. Load sample data for testing
4. Reset all data if needed

## Sample Data

The app includes sample data for testing:
- 5 ministries (Education, Health, Agriculture, Works, Finance)
- 6 sample memos with different statuses and priorities
- Various memo actions for history demonstration

## Color Scheme

- **Primary Green**: #2E7D32 (Dark green for headers and primary actions)
- **Light Green**: #4CAF50 (Accent color)
- **White**: #FFFFFF (Background and cards)
- **Gray**: #757575 (Secondary text)
- **Success**: #388E3C (Approved status)
- **Error**: #D32F2F (Rejected status)
- **Warning**: #F57C00 (Request details status)

## Performance Features

- **Optimized Rendering**: Efficient FlatList components
- **Lazy Loading**: Data loaded only when needed
- **Memory Management**: Proper cleanup and state management
- **Responsive Design**: Adapts to all screen sizes

## Future Enhancements

- Push notifications for new memos
- Dark mode support
- Offline synchronization
- User authentication
- Advanced filtering and search
- Export functionality
- Multi-language support

## Development

### Project Structure
```
src/
├── navigation/          # Navigation configuration
├── screens/            # App screens
├── services/           # Data services
├── styles/             # Global styles and colors
├── types/              # TypeScript interfaces
└── App.tsx            # Main app component
```

### Key Dependencies
- `@react-navigation/native`: Navigation
- `@react-navigation/bottom-tabs`: Bottom tab navigation
- `@react-navigation/stack`: Stack navigation
- `@react-native-async-storage/async-storage`: Local storage
- `@expo/vector-icons`: Icons
- `react-native-safe-area-context`: Safe area handling

## License

© 2024 Katsina State Government. All rights reserved.
