# 💰 AI Finance Tracker

> Smart money management powered by artificial intelligence

An intelligent finance tracking application that uses AI to automatically extract and categorize transactions from bank statements, providing insightful analytics and expense management.

## ✨ Features

- 🤖 **AI-Powered Statement Processing** - Automatically extract transactions from PDF/text bank statements
- 📊 **Interactive Dashboard** - Real-time visualization of income, expenses, and balance
- 📈 **Expense Analytics** - Category-wise breakdown and monthly spending trends
- 💳 **Transaction Management** - View, edit, and categorize all transactions
- 🔐 **Secure Authentication** - JWT-based user authentication and authorization
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React** - UI library for building interactive interfaces
- 🎨 **CSS3** - Custom styling with modern layouts
- 📊 **Recharts** - Beautiful and responsive charts
- 🔄 **React Router** - Client-side routing
- 🌐 **Axios** - HTTP client for API requests

### **Backend**
- 🟢 **Node.js** - JavaScript runtime environment
- 🚀 **Express.js** - Fast web framework for Node.js
- 🍃 **MongoDB** - NoSQL database for data storage
- 🔗 **Mongoose** - MongoDB object modeling
- 🔑 **JWT** - Secure authentication tokens
- 🔒 **bcrypt** - Password hashing

### **AI Services**
- 🧠 **Google Gemini AI** - Advanced statement processing
- ⚡ **Groq API** - Fast AI inference
- 🤖 **OpenAI** - Alternative AI processing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- API keys for AI services (Gemini/Groq/OpenAI)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-finance-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your API keys and MongoDB URI to .env
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:9090`

## 🔑 Environment Variables

Create `.env` files in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=auto
```

## 📖 Usage

1. **Register/Login** - Create an account or login
2. **Upload Statement** - Upload your bank statement (PDF/TXT)
3. **AI Processing** - Let AI extract and categorize transactions
4. **View Dashboard** - Analyze your financial data with interactive charts
5. **Manage Transactions** - Edit, delete, or recategorize transactions

## 🎯 Project Structure

```
ai-finance-tracker/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── models/   # MongoDB schemas
│   │   ├── routes/   # API routes
│   │   ├── services/ # AI processing services
│   │   └── utils/    # Helper functions
│   └── package.json
└── frontend/         # React application
    ├── src/
    │   ├── components/ # Reusable components
    │   ├── pages/      # Page components
    │   ├── styles/     # CSS files
    │   └── api/        # API integration
    └── package.json
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ using AI and modern web technologies
