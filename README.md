# AI Tutoring Tool

![AI Tutoring Tool](https://placeholder.svg?height=300&width=600&text=AI+Tutoring+Tool)

An interactive educational platform powered by Google's Gemini Flash AI that provides personalized learning experiences, task management, and real-time tutoring through chat and video calls.

## 🌟 Features

### 🤖 AI-Powered Learning
- **Intelligent Chat Assistant**: Get instant answers to your academic questions using Gemini Flash AI
- **Personalized Task Generation**: AI creates custom learning tasks based on subject and difficulty
- **Smart Resource Recommendations**: Contextually relevant learning materials suggested based on your conversations

### 📊 Progress Tracking
- **Task Management**: Create, track, and complete educational tasks
- **Streak System**: Maintain daily learning streaks to build consistent study habits
- **Visual Progress Indicators**: See your progress across different subjects

### 🎥 Interactive Learning
- **Video Calls**: Connect with tutors through real-time video sessions
- **Screen Sharing**: Share your screen to get help with specific problems
- **File Sharing**: Attach and share documents, images, and other files in chat

### 📚 Resource Library
- **Curated Resources**: Access high-quality educational resources organized by subject
- **AI Recommendations**: Get personalized resource suggestions based on your learning needs
- **External Integrations**: Connect to popular educational platforms like Khan Academy

## 🛠️ Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **AI Integration**: Google Gemini Flash API
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React icons

## 📋 Prerequisites

- Node.js 18.x or higher
- Google Gemini API key

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-tutoring-tool.git
   cd ai-tutoring-tool

   ```markdown project="AI Tutoring Tool" file="README.md"
...
```

2. Install dependencies:

```shellscript
npm install
```


3. Create a `.env.local` file in the root directory and add your Gemini API key:

```plaintext
GEMINI_API_KEY=your_gemini_api_key_here
```


4. Start the development server:

```shellscript
npm run dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## 📱 Usage Guide

### Home Page

- Learn about the platform's features
- Get started by clicking the "Get Started" button


### Dashboard

- View your learning progress and streaks
- Manage your daily tasks
- Generate AI-powered learning tasks
- Access quick links to chat and video features


### Chat

- Ask questions to the AI tutor
- Attach files for more context
- View AI-recommended resources
- Browse the resource library by subject


### Video Call

- Start or join a tutoring session
- Share your screen for better explanations
- Raise hand to get attention
- Use the chat feature during the call


## 📁 Project Structure

```
ai-tutoring-tool/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   │   ├── chat/         # Chat API endpoints
│   │   └── tasks/        # Task generation endpoints
│   ├── chat/             # Chat interface
│   ├── dashboard/        # User dashboard
│   ├── login/            # Authentication pages
│   ├── video/            # Video call interface
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable UI components
├── utils/                # Utility functions
│   └── gemini-api.ts     # Gemini API integration
├── public/               # Static assets
└── styles/               # Global styles
```

## 🧩 Key Components

### AI Integration

The application uses Google's Gemini Flash API for:

- Answering educational questions
- Generating personalized learning tasks
- Providing contextual explanations


### Task Management

- Create manual tasks
- Generate AI-suggested tasks based on subject and difficulty
- Track completion and progress


### Resource Library

- Curated educational resources by subject
- AI-recommended resources based on conversation context
- External links to high-quality learning platforms


### Video Tutoring

- Real-time video communication
- Screen sharing capabilities
- Interactive features like hand raising and chat


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) for AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons


---

Built with ❤️ for education
```

This README provides a comprehensive overview of your AI Tutoring Tool project. It includes detailed information about the features, technologies used, installation instructions, and usage guidelines. The document is structured to help both users and potential contributors understand what your application does and how to use it.

You can customize this README further by:

1. Adding actual screenshots of your application
2. Including more specific setup instructions if needed
3. Adding badges for build status, version, etc.
4. Expanding the contributing guidelines with more specific information