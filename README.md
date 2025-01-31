# AI Tutoring Tool - README

Welcome to the *AI Tutoring Tool*! This project is a comprehensive web application designed to enhance learning through AI-powered explanations, interactive tools, and real-time video calls. Below is a step-by-step guide to help you set up and understand the project.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Setup Instructions](#setup-instructions)
5. [Folder Structure](#folder-structure)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

---

## Project Overview

The *AI Tutoring Tool* is a web-based platform that provides:
- *AI-Powered Chat Interface*: Interact with an AI assistant for personalized learning.
- *Progress Tracking*: Track learning progress with visual indicators and streaks.
- *Video Call Integration*: Engage in real-time video calls for tutoring sessions.
- *Interactive Features*: Quizzes, flashcards, and daily challenges to boost learning.

---

## Features

### 1. *AI Chat Interface*
   - Chat with an AI assistant powered by Google's Gemini API.
   - Real-time typing effect for AI responses.
   - Light and dark theme support.
   - File attachment support for sharing resources.

### 2. *Progress Tracking*
   - Visual progress rings for different subjects (e.g., reading, math).
   - Streak counter to motivate consistent learning.
   - Calendar view for tracking daily challenges.

### 3. *Video Call Integration*
   - Real-time video and audio communication.
   - Toggle audio and video during calls.
   - End call functionality.

### 4. *Interactive Tools*
   - Daily tasks and challenges.
   - Achievements and progress visualization.
   - Responsive design for all devices.

---

## Technologies Used

- *Frontend*:
  - HTML5, CSS3, JavaScript
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [Anime.js](https://animejs.com/) for animations
  - [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/) for scroll animations

- *Backend*:
  - No backend required (frontend-only project).
  - Uses Google's Gemini API for AI chat functionality.

- *APIs*:
  - [Google Gemini API](https://developers.generativeai.google/) for AI-powered chat.

- *Other Tools*:
  - WebRTC for video call functionality.
  - LocalStorage for saving chat history and user preferences.

---

## Setup Instructions

### 1. *Clone the Repository*
   bash
   git clone https://github.com/your-username/ai-tutoring-tool.git
   cd ai-tutoring-tool
   

### 2. *Install Dependencies*
   This project uses CDN links for all dependencies, so no installation is required. However, ensure you have a modern browser (Chrome, Firefox, or Edge).

### 3. *Set Up Google Gemini API*
   - Obtain an API key from [Google's Gemini API](https://developers.generativeai.google/).
   - Replace the API_KEY placeholder in the chat.html file with your actual API key:
     javascript
     const API_KEY = 'YOUR_API_KEY_HERE';
     

### 4. *Run the Project*
   - Open the index.html file in your browser to start the application.
   - Alternatively, use a local server (e.g., VS Code Live Server) for better performance.

---

## Folder Structure


ai-tutoring-tool/
│
├── index.html              # Main landing page
├── login.html              # Login and signup page
├── chat.html               # AI chat interface
├── video.html              # Video call interface
├── README.md               # Project documentation
├── images/                 # Folder for static images (if any)
└── script.js               # JavaScript for login/signup functionality


---

## Usage

### 1. *Landing Page*
   - Visit index.html to see the main landing page.
   - Click "Try It Now" to navigate to the login page.

### 2. *Login/Signup*
   - Use login.html to log in or sign up as a student or parent.
   - Toggle between login and signup forms.

### 3. *AI Chat Interface*
   - Visit chat.html to interact with the AI assistant.
   - Type your questions, attach files, and toggle themes.

### 4. *Progress Tracking*
   - Track your learning progress with visual indicators and streaks.
   - Complete daily challenges and tasks.

### 5. *Video Call(Webrtc)*
   - Visit video.html to start a video call(not working).
   - Toggle audio and video, and end the call when done.

---

## Contributing

Contributions are welcome! Follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature/YourFeatureName).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/YourFeatureName).
5. Open a pull request.

---

## License

This project is licensed under the *MIT License*. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Google Gemini API](https://developers.generativeai.google/) for AI capabilities.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Anime.js](https://animejs.com/) for animations.

---

Enjoy using the *AI Tutoring Tool*! For any questions or issues, please open an issue on GitHub. 🚀
