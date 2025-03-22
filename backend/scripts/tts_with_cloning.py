import os
import numpy as np
from TTS.api import TTS

# Get the absolute path to the backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Move up one level to backend/

# Construct absolute paths for required files
embedding_path = os.path.join(BASE_DIR, "uploads", "speaker_embedding.npy")
original_speech_path = os.path.join(BASE_DIR, "uploads", "original_speech.wav")

# Ensure the files exist before proceeding
if not os.path.exists(embedding_path):
    raise FileNotFoundError(f"Speaker embedding file not found: {embedding_path}")

if not os.path.exists(original_speech_path):
    raise FileNotFoundError(f"Original speech file not found: {original_speech_path}")

# Load the speaker embedding
speaker_embedding = np.load(embedding_path)

# Load the Coqui TTS model
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False).to("cpu")

def generate_speech(text, output_path):
    output_audio_path = os.path.join(BASE_DIR, "uploads", output_path)
    tts.tts_to_file(
        text=text,
        file_path=output_audio_path,
        speaker_wav=original_speech_path,
        speaker_embedding=speaker_embedding
    )

# Example usage
if __name__ == "__main__":
    translated_text = "Hola, ¿cómo estás?"  # Translated text
    output_audio_file = "cloned_speech.wav"
    
    generate_speech(translated_text, output_audio_file)
    
    print(f"Generated speech saved at {os.path.join(BASE_DIR, 'uploads', output_audio_file)}")
