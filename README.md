# �� AI-Powered Finance Tracker

A comprehensive full-stack finance management application that leverages artificial intelligence to automatically parse bank statements and provide intelligent financial insights. Built with modern web technologies and powered by OpenAI's GPT models for seamless transaction extraction and categorization.

## 🚀 Features

### 📄 Smart Statement Processing

- **Multi-format Support**: Upload PDF, CSV, and TXT bank statements
- **AI-Powered Extraction**: Automatically extract transactions using OpenAI GPT-3.5-turbo
- **Real-time Processing**: Instant parsing and categorization of financial data
- **Currency Detection**: Automatic currency detection and formatting (INR, USD, EUR, etc.)

### 💳 Transaction Management

- **Intelligent Categorization**: AI automatically categorizes transactions (food, transport, entertainment, etc.)
- **Manual Editing**: Edit and correct AI-parsed data
- **Transaction History**: Complete transaction history with search and filter capabilities
- **CRUD Operations**: Create, read, update, and delete transactions

### 📊 Financial Dashboard

- **Visual Analytics**: Interactive charts and graphs for spending patterns
- **Category Breakdown**: Pie charts showing expense distribution
- **Income vs Expenses**: Clear visualization of financial flow
- **Real-time Statistics**: Live updates of financial metrics

### 🔐 User Management

- **Secure Authentication**: JWT-based authentication system
- **User Registration**: Easy account creation and management
- **Protected Routes**: Secure access to user-specific data
- **Session Management**: Persistent login sessions

## 🛠️ Tech Stack

### Frontend

- **React.js 18** - Modern UI library with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **CSS3** - Custom styling with responsive design
- **Axios** - HTTP client for API communication

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload middleware
- **PDF.js** - PDF parsing library
- **CSV-Parse** - CSV file processing

### AI & Machine Learning

- **OpenAI GPT-3.5-turbo** - AI model for transaction extraction
- **Custom Prompt Engineering** - Optimized prompts for bank statement parsing
- **Fallback Parsing** - Simple parser for when AI quota is exceeded

### Development Tools

- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting and formatting
- **Git** - Version control
- **Postman/Thunder Client** - API testing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-finance-tracker.git
   cd ai-finance-tracker
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the backend directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-finance-tracker

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # OpenAI API Key
   OPENAI_API_KEY=your-openai-api-key-here

   # Server Configuration
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the application**

   **Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 Usage

### 1. **Registration & Login**

- Create a new account or login with existing credentials
- Secure JWT-based authentication

### 2. **Upload Bank Statement**

- Navigate to "Upload Statement" page
- Upload PDF, CSV, or TXT bank statement
- AI automatically extracts and categorizes transactions

### 3. **View Transactions**

- Browse all transactions in the "Transactions" page
- Edit or delete transactions as needed
- View categorized spending patterns

### 4. **Dashboard Analytics**

- Monitor financial health with visual charts
- Track income vs expenses
- Analyze spending by category

## �� Project Structure

```
ai-finance-tracker/
├── backend/
│ ├── src/
│ │ ├── config/ # Database and AI configurations
│ │ ├── controllers/ # Route controllers
│ │ ├── middleware/ # Authentication and validation
│ │ ├── models/ # Database models
│ │ ├── routes/ # API routes
│ │ ├── services/ # Business logic and AI processing
│ │ └── utils/ # Utility functions
│ ├── uploads/ # Uploaded files storage
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── pages/ # Page components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── utils/ # Utility functions
│ │ ├── styles/ # CSS styles
│ │ └── api/ # API client
│ └── package.json
└── README.md

```

## 🎯 Project Scope

### Core Functionality
- ✅ **File Upload System** - Support for multiple bank statement formats
- ✅ **AI-Powered Parsing** - Intelligent transaction extraction using OpenAI
- ✅ **Transaction Management** - Full CRUD operations for transactions
- ✅ **User Authentication** - Secure user registration and login
- ✅ **Financial Dashboard** - Visual analytics and insights
- ✅ **Real-time Processing** - Instant statement processing and categorization

### Advanced Features
- 🔄 **Multi-currency Support** - Automatic currency detection and formatting
- 🔄 **Smart Categorization** - AI-based transaction categorization
- 🔄 **Data Validation** - Robust error handling and data validation
- 🔄 **Responsive Design** - Mobile-friendly interface
- 🔄 **Export Functionality** - Export data to CSV/PDF

### Future Enhancements
- 📈 **Budget Tracking** - Set and monitor budgets
- 📊 **Advanced Analytics** - More detailed financial insights
- 🔔 **Notifications** - Spending alerts and reminders
- 📱 **Mobile App** - Native mobile application
- �� **Bank Integration** - Direct bank API integration
- 🤖 **ML Models** - Custom machine learning models for better categorization

## �� Troubleshooting

### Common Issues

1. **OpenAI API Quota Exceeded**
   - Check your OpenAI account billing
   - Add credits or upgrade your plan
   - Get a new API key if needed

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

3. **File Upload Errors**
   - Check file format (PDF, CSV, TXT only)
   - Ensure file size is under 5MB
   - Verify file is not corrupted

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ��‍💻 Author

**Pratik Raj**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- MongoDB for the database solution
- React team for the amazing frontend library
- Express.js community for the robust backend framework

---

⭐ **Star this repository if you found it helpful!**

�� **Live Demo**: [https://your-demo-url.com](https://your-demo-url.com)

📧 **Support**: For support, email your.email@example.com or create an issue.