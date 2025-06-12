# 🤖 LLM Interface with Ollama

A beautiful web interface to interact with Large Language Models through Ollama.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.2-green?logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-orange?logo=sqlite&logoColor=white)

## ✨ Features

- 🌐 **Intuitive Web Interface** - Clean and modern UI for seamless interaction
- 📝 **Markdown Support** - Rich text formatting in responses
- 🎨 **Syntax Highlighting** - Beautiful code block rendering
- 🔧 **Extensible Architecture** - Easy to add new models and features
- 💾 **Conversation History** - (Coming soon)
- 📤 **Export Conversations** - (Coming soon)
- ⚡ **Real-time Response Display** - (Coming soon)

## 🏗️ Architecture Overview

This project follows a clean Flask application structure with separation of concerns:

```
LLM-interface/
├── 📁 app/                    # Main application package
│   ├── 📁 main/              # Main blueprint (web interface)
│   │   ├── __init__.py       # Blueprint initialization
│   │   └── routes.py         # Web routes and view functions
│   ├── 📁 api/               # API blueprint (REST endpoints)
│   │   ├── __init__.py       # API blueprint initialization
│   │   └── routes.py         # API endpoints
│   ├── 📁 templates/         # Jinja2 HTML templates
│   │   └── index.html        # Main chat interface
│   ├── 📁 static/           # Static assets
│   │   ├── css/             # Stylesheets
│   │   └── js/              # JavaScript files
│   ├── 📁 utils/            # Utility functions
│   ├── __init__.py          # App factory pattern
│   └── models.py            # SQLAlchemy database models
├── 🗄️ app.db                # SQLite database
├── ⚙️ config.py             # Configuration settings
├── 🚀 run.py                # Application entry point
└── 📋 requirements.txt      # Python dependencies
```

### 🔧 Core Components

#### 🏭 **App Factory Pattern** (`app/__init__.py`)

- Uses Flask's application factory for better modularity
- Initializes SQLAlchemy database
- Registers blueprints for main and API routes

#### 🗃️ **Database Models** (`app/models.py`)

- **Conversation**: Stores chat sessions with timestamps
- **Message**: Individual messages with user/AI distinction and model tracking
- Relationship: One conversation has many messages

#### 🌐 **Web Interface** (`app/main/routes.py`)

- Serves the main chat interface
- Handles conversation display and management

#### 🔌 **API Layer** (`app/api/routes.py`)

- RESTful endpoints for frontend communication
- Handles Ollama integration and message processing

#### ⚙️ **Configuration** (`config.py`)

- Environment-based configuration
- Ollama URL and model settings
- Database connection strings

## 🔄 How It Works

1. **🌟 User Interaction**: User types a message in the web interface
2. **📡 API Call**: Frontend sends POST request to `/api/chat` endpoint
3. **🤖 Ollama Integration**: Backend forwards request to Ollama server
4. **💾 Data Persistence**: Conversation and messages are saved to SQLite database
5. **📤 Response Streaming**: AI response is streamed back to the frontend
6. **🎨 Rendering**: Markdown content is rendered with syntax highlighting

## 🚀 Prerequisites

- 🐍 **Python 3.8+**
- 🦙 **Ollama** installed and running on port 11434
- 🤖 **llama3** model loaded in Ollama

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/julienBelinga/LLM-interface.git
cd LLM-interface
```

2. **Create virtual environment:**

```bash
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
.\venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Environment setup:**

```bash
cp .env.example .env
# Edit .env file with your configuration
```

## 🎯 Quick Start

```bash
python run.py
```

The application will be available at **http://localhost:5000** 🌐

## 🔧 Configuration

The application can be configured through environment variables in `.env`:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db
OLLAMA_URL=http://localhost:11434
DEFAULT_MODEL=llama3
```

## 🚀 Future Enhancements

- 📤 **Export Conversations** - Save chats as PDF/Markdown
- 🔍 **Search History** - Find specific conversations quickly
- 🎨 **Theme Customization** - Dark/Light mode support
- 📊 **Analytics Dashboard** - Usage statistics and insights
- 🔐 **User Authentication** - Multi-user support
- 🌍 **Multi-language Support** - Internationalization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ and 🤖
