from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from pydub import AudioSegment
from pydub.utils import which

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Set upload directory
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Check for FFmpeg installation
if not which("ffmpeg"):
    raise RuntimeError("FFmpeg is not installed or not found in system PATH.")

# Change all requests to point to server.py (port 5000)
SERVER_URL = "http://127.0.0.1:5000"

@app.route("/")
def home():
    return "Flask API Gateway is Running!"

@app.route("/upload", methods=["POST"])
def upload_audio():
    """Handle file uploads and forward to transcription service."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Convert to WAV format if needed
        audio = AudioSegment.from_file(file_path)
        wav_path = file_path.rsplit(".", 1)[0] + ".wav"
        audio.export(wav_path, format="wav")

        if not os.path.exists(wav_path):
            return jsonify({"error": "WAV file conversion failed"}), 500

        return jsonify({"message": "File saved", "path": wav_path})

    except Exception as e:
        return jsonify({"error": f"Audio processing error: {str(e)}"}), 500

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    """Forward audio file to server.py for processing."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Forward file to server.py (transcription)
        url = f"{SERVER_URL}/transcribe"
        files = {"file": open(file_path, "rb")}
        response = requests.post(url, files=files)
        return response.json()

    except Exception as e:
        return jsonify({"error": f"Failed to forward request: {str(e)}"}), 500

@app.route("/translate", methods=["POST"])
def translate_text():
    """Forward text translation request to server.py."""
    data = request.get_json()
    if not data or "text" not in data or "language" not in data:
        return jsonify({"error": "Missing text or language input"}), 400

    try:
        response = requests.post(f"{SERVER_URL}/translate", json=data)
        return response.json()

    except Exception as e:
        return jsonify({"error": f"Failed to forward request: {str(e)}"}), 500

@app.route("/generate_speech", methods=["POST"])
def generate_speech():
    """Forward TTS request to server.py."""
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing text input"}), 400

    try:
        response = requests.post(f"{SERVER_URL}/synthesize", json=data)
        return response.json()

    except Exception as e:
        return jsonify({"error": f"Failed to forward request: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Runs on port 5001 to act as an API gateway
