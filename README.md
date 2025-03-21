# Lang-X

Lang-X is an AI-powered voice cloning application that records or accepts an audio sample in English and converts it into Spanish, French, and Mandarin while preserving the original speaker's voice characteristics. The application leverages **OpenAI Whisper** for speech-to-text, **a translation model** for multilingual support, and **Coqui TTS** for text-to-speech synthesis.

## Features 🚀

- 🎙️ **Voice Recording & Upload**: Capture voice directly from the browser.
- 📝 **Speech-to-Text (Transcription)**: Converts recorded speech into text using OpenAI Whisper.
- 🌍 **Text Translation**: Translates transcribed text into multiple languages.
- 🗣️ **Voice Cloning & Synthesis**: Generates speech in the translated language while preserving the speaker's voice.
- 📂 **Download & Playback**: Listen to or download the generated speech output.
- 🎨 **Modern UI**: Built using React and Material-UI for a smooth user experience.

---

## Demo

🔗 \*\*Live Demo: link to be updated

---

## Tech Stack

### **Frontend**

- ⚛️ React (Create-React-App)
- 🎨 Material-UI (MUI)
- 📡 Fetch API for handling requests

### **Backend**

- 🐍 Flask (Python)
- 🗣️ OpenAI Whisper for transcription
- 🌍 Translation model for multilingual support
- 🎤 Coqui TTS for speech synthesis

---

## Installation & Setup

### 1️⃣ Clone the Repository

git clone https://github.com/yourusername/lang-x.git
cd lang-x

### 2️⃣ **Backend Setup (Flask API)**

    🔹 **Install Dependencies**
        cd backend
        python3 -m venv venv
        source venv/bin/activate  # On Windows use `venv\Scripts\activate`
        pip install -r requirements.txt

        *Configure Environment Variables*
        Create a .env file inside the backend directory and add the required API keys and configurations.

        *Run the Flask Server*
        python server.py

        (Make sure it runs on http://192.168.0.100:5000 as per your setup.)

### 3 **Frontend Setup (React App)**

    🔹 **Install Dependencies**
        cd ../  # Move to the root directory
        npm install

    🔹 **Start the React App**
        npm start

        (Runs the app on http://localhost:3000.)

---

## File Structure

lang-x/
│── backend/ # Backend (Flask API)
│ ├── models/ # AI models for processing
│ ├── uploads/ # Uploaded audio files
│ ├── utils/ # Utility scripts for processing
│ │ ├── audio_utils.py # Helper functions for audio processing
│ ├── app.py # Entry point for backend API
│ ├── server.py # Main Flask server handling requests
│ ├── transcribe.py # Handles speech-to-text processing
│ ├── .env # Environment variables (not shared)
│ ├── requirements.txt # Python dependencies
│── src/ # Frontend (React)
│ ├── components/ # UI Components
│ │ ├── AudioPlayer.js # Audio playback component
│ │ ├── Layout.js # Page layout component
│ │ ├── Recorder.js # Voice recorder component
│ │ ├── Sidebar.js # Sidebar navigation
│ ├── pages/ # Main pages
│ │ ├── Home.js # Home page
│ ├── api.js # API calls to backend
│ ├── App.js # Main React App component
│ ├── index.js # App entry point
│── public/ # Static assets
│── .gitignore # Git ignored files
│── package.json # Node.js dependencies
│── README.md # Documentation

---

## API Endpoints Used

🔹 Frontend Requests

    Method      Endpoint            Description
    POST        /upload             Uploads recorded audio
    POST        /transcribe         Transcribes speech to text
    POST        /translate          Translates text to Spanish, French, or Mandarin
    POST        /synthesize         Converts translated text to speech

---

### Contribution

    Feel free to fork this repository, open issues, and submit pull requests!

    git checkout -b feature-branch
    git commit -m "Add new feature"
    git push origin feature-branch

---

### License

📜 This project is licensed under the MIT License.

### Contact

If you have any questions, feel free to reach out via GitHub Issues. 🚀

---

This **README.md** provides everything needed to **set up and run the repository locally** while also describing **features, tech stack, API usage, and contribution guidelines**.

Let me know if you’d like any modifications! 🚀

**Made by Siddhartha Srivastava**
Contact: realsiddhartha@outlook.com
