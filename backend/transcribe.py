import whisper
import os
import torch
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import MarianMTModel, MarianTokenizer
from TTS.api import TTS  # Import Coqui TTS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# Detect if CUDA (GPU) is available
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load Whisper model for transcription and move to the correct device
whisper_model = whisper.load_model("base").to(device)

# Load translation models
translation_models = {
    "es": "Helsinki-NLP/opus-mt-en-es",
    "fr": "Helsinki-NLP/opus-mt-en-fr",
    "zh": "Helsinki-NLP/opus-mt-en-zh",
}

# Load MarianMT models and tokenizers, move models to device
loaded_models = {}
for lang, model_name in translation_models.items():
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name).to(device)
    loaded_models[lang] = (tokenizer, model)

# Load Coqui TTS for voice cloning
tts_model = "tts_models/multilingual/multi-dataset/xtts_v2"
tts = TTS(tts_model).to(device)  # Use GPU if available


def translate_text(text, target_lang):
    """Translate detected language text into the specified language."""
    try:
        tokenizer, model = loaded_models[target_lang]
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
        translated = model.generate(**inputs)
        return tokenizer.decode(translated[0], skip_special_tokens=True)
    except Exception as e:
        print(f"Translation Error ({target_lang}):", str(e))
        return None


def generate_speech(text, lang_code, output_path, speaker_wav=None):
    """Generate speech from text while retaining speaker voice if applicable."""
    try:
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav if speaker_wav else None,  # Use reference speaker only if provided
            language=lang_code,
            file_path=output_path
        )
        return True
    except Exception as e:
        print(f"TTS Error ({lang_code}):", str(e))
        return False


@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["file"]
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)

    try:
        # Transcribe audio and auto-detect language
        result = whisper_model.transcribe(audio_path, language=None)  # Auto-detect language
        transcribed_text = result["text"]
        detected_lang = result.get("language", "en")  # Default to English if detection fails

        # Translate the transcription
        translations = {}
        for lang_code in ["es", "fr", "zh"]:
            translated_text = translate_text(transcribed_text, lang_code)
            if translated_text:
                translations[lang_code] = translated_text

        # Generate speech for each translation
        tts_outputs = {}
        for lang_code in ["es", "fr", "zh"]:
            output_file = f"tts_output_{lang_code}.wav"
            if lang_code in translations:
                success = generate_speech(translations[lang_code], lang_code, output_file, speaker_wav=audio_path)
                if success:
                    tts_outputs[lang_code] = f"http://127.0.0.1:5001/download/{lang_code}"

        # Cleanup temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)

        return jsonify({
            "transcription": transcribed_text,
            "detected_language": detected_lang,  # Include detected language
            "translations": translations,
            "tts_audio": tts_outputs  # URLs to download/play generated speech
        })

    except Exception as e:
        print("Error in /transcribe:", str(e))
        return jsonify({"error": "Failed to process audio"}), 500


@app.route("/download/<lang>", methods=["GET"])
def download_audio(lang):
    """Serve generated audio files."""
    file_path = f"tts_output_{lang}.wav"
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(port=5001, debug=True)
