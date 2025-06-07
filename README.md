# Phone Number Management Application

A modern web application for managing and processing phone numbers with TypeScript and React.

## Features

- Phone Number Management
  - Add, edit, and delete phone numbers
  - Support for Brazilian phone numbers
  - Batch import from Excel, CSV, and TXT files
  - Export phone numbers and messages
- Message Management
  - Compose and send messages
- Track message status
- View message history
- File Transfer with Firebase Storage
- User Interface
  - Modern and responsive design
  - Real-time notifications
  - Error handling and validation
  - Session management
- Analytics
  - Track user interactions
  - Monitor message sending statistics

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd prospectador-pj
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The app will be available at `http://localhost:3000`

## Usage

1. Add Phone Numbers:
   - Enter phone numbers manually
   - Upload files (Excel, CSV, TXT)
   - Copy-paste multiple numbers

2. Manage Messages:
   - Compose messages with rich text
   - Send messages to selected numbers
   - Track message status

3. Export Data:
   - Export phone numbers as JSON
   - Export message history
   - Download session data

## Technologies Used

- React
- TypeScript
- Material-UI
- read-excel-file
- React Router
- React Toastify
- React Query

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Support

For support, email support@example.com or create an issue in the repository.

## Acknowledgments

- Special thanks to the open-source community
- Inspiration from modern web development practices
- Thanks to all contributors
