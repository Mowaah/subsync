# SUBSYNC - Digital Subscription Management App

SUBSYNC is a mobile application built with React Native that helps users track and manage their digital subscriptions (newsletters, streaming services, software, etc.).

## Features

- **Track Subscriptions**: Keep track of all your digital subscriptions in one place
- **Manage Costs**: See how much you're spending on subscriptions monthly and yearly
- **Get Reminders**: Receive notifications before renewals to avoid unwanted charges
- **Dark Mode**: Toggle between light and dark themes or use system settings
- **Categorize**: Organize subscriptions by category for better overview
- **Customizable**: Add custom billing cycles and categories

## Tech Stack

- React Native
- TypeScript
- Redux Toolkit for state management
- React Native Paper for UI components
- React Navigation for navigation
- AsyncStorage for local data persistence

## Installation

1. Make sure you have React Native development environment set up. If not, follow the [official guide](https://reactnative.dev/docs/environment-setup).

2. Clone the repository:

```bash
git clone https://github.com/yourusername/subsync.git
cd subsync
```

3. Install dependencies:

```bash
npm install
```

4. For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

5. Start the application:

```bash
npm start
```

6. Run on a specific platform:

```bash
npm run android
# or
npm run ios
```

## Usage

1. **Adding a Subscription**:

   - Tap on the "+" button
   - Fill in the details (name, cost, billing cycle, etc.)
   - Save the subscription

2. **View Subscription Details**:

   - Tap on any subscription card
   - View all details, including next billing date
   - Edit or delete if needed

3. **Get Reminders**:

   - Go to the "Reminders" tab
   - View upcoming renewals
   - Set notification preferences

4. **Change Theme**:
   - Go to the "Settings" tab
   - Toggle dark theme or use system settings

## Screenshots

[Screenshots will be added in the future]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons provided by Material Design
- Color scheme inspired by Material 3 design system
