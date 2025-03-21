from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import time
import logging
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from transformers import pipeline
from TTS.api import TTS  # Import Coqui TTS
from utils.audio_utils import convert_to_wav, is_allowed_file  # Import audio utility functions

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv()

# Retrieve values
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
PROCESSED_FOLDER = os.getenv("PROCESSED_FOLDER", "processed")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "openai/whisper-small")
TTS_MODEL = os.getenv("TTS_MODEL", "tts_models/en/ljspeech/tacotron2-DDC")  # Adjusted for Coqui TTS
TRANSLATION_MODEL = os.getenv("TRANSLATION_MODEL", "facebook/m2m100_418M")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Ensure critical variables are loaded
assert UPLOAD_FOLDER, "UPLOAD_FOLDER is not set in the environment variables!"
assert PROCESSED_FOLDER, "PROCESSED_FOLDER is not set in the environment variables!"

# Configure Logging
logging.basicConfig(level=logging.INFO)

logging.info(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}")
logging.info(f"PROCESSED_FOLDER: {PROCESSED_FOLDER}")
logging.info(f"WHISPER_MODEL: {WHISPER_MODEL}")
logging.info(f"TTS_MODEL: {TTS_MODEL}")
logging.info(f"TRANSLATION_MODEL: {TRANSLATION_MODEL}")
logging.info(f"HOST: {HOST}")
logging.info(f"PORT: {PORT}")
logging.info(f"DEBUG: {DEBUG}")

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)

# Load Models
try:
    whisper_model = pipeline("automatic-speech-recognition", model=WHISPER_MODEL)
    logging.info(f"Loaded Whisper model: {WHISPER_MODEL}")
except Exception as e:
    logging.error(f"Error loading Whisper model {WHISPER_MODEL}: {e}")
    whisper_model = None

try:
    tts_model = TTS(TTS_MODEL)  # Load Coqui TTS
    logging.info(f"Loaded TTS model: {TTS_MODEL}")
except Exception as e:
    logging.error(f"Error loading TTS model {TTS_MODEL}: {e}")
    tts_model = None

try:
    translation_model = pipeline("translation", model=TRANSLATION_MODEL)
    logging.info(f"Loaded Translation model: {TRANSLATION_MODEL}")
except Exception as e:
    logging.error(f"Error loading Translation model {TRANSLATION_MODEL}: {e}")
    translation_model = None

@app.route("/")
def index():
    return jsonify({"message": "AI Voice Server Running"})

# Transcribe Audio
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and is_allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        try:
            if not whisper_model:
                return jsonify({"error": "Whisper model not loaded"}), 500

            # Convert to WAV before transcription
            wav_path = convert_to_wav(file_path)
            if wav_path != file_path:
                os.remove(file_path)  # Remove original file if converted

            start_time = time.time()
            transcription = whisper_model(wav_path)["text"]
            duration = round(time.time() - start_time, 2)

            return jsonify({"transcription": transcription, "processing_time": duration}), 200
        except Exception as e:
            logging.error(f"Error during transcription: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400

# Translate Text (Fixed src_lang & tgt_lang)
@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.json
    text = data.get("text", "")
    detected_language = data.get("detected_language", "en")  # Accept detected language dynamically
    target_language = data.get("language", "es")  # Default to Spanish if not specified

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if not translation_model:
        return jsonify({"error": "Translation model not loaded"}), 500

    try:
        logging.info(f"Translating from {detected_language} to {target_language}: {text}")
        
        # Ensure we pass src_lang and tgt_lang
        translated_text = translation_model(
            text, src_lang=detected_language, tgt_lang=target_language, max_length=400
        )[0]["translation_text"]
        
        return jsonify({
            "translated_text": translated_text,
            "detected_language": detected_language
        }), 200
    except Exception as e:
        logging.error(f"Error during translation: {e}")
        return jsonify({"error": str(e)}), 500

# Synthesize Speech
@app.route("/synthesize", methods=["POST"])
def synthesize_speech():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if not tts_model:
        return jsonify({"error": "TTS model not loaded"}), 500

    output_file = os.path.join(PROCESSED_FOLDER, "speech.wav")

    try:
        # Use Coqui TTS to generate speech
        tts_model.tts_to_file(text=text, file_path=output_file)

        return send_file(output_file, as_attachment=True, mimetype="audio/wav")
    except Exception as e:
        logging.error(f"Error during TTS synthesis: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=DEBUG)
