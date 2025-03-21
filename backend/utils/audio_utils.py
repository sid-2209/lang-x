import os
from pydub import AudioSegment
from pydub.utils import which

# Ensure FFmpeg is installed
if not which("ffmpeg"):
    raise RuntimeError("FFmpeg is not installed or not found in system PATH.")

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "m4a"}

def is_allowed_file(filename):
    """Check if the file has a valid audio extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_wav(file_path):
    """Convert audio file to WAV format if necessary."""
    try:
        audio = AudioSegment.from_file(file_path)
        wav_path = file_path.rsplit(".", 1)[0] + ".wav"
        audio.export(wav_path, format="wav")
        return wav_path
    except Exception as e:
        raise RuntimeError(f"Audio conversion error: {e}")

def get_audio_duration(file_path):
    """Return the duration of an audio file in seconds."""
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000  # Convert ms to seconds
    except Exception as e:
        raise RuntimeError(f"Error reading audio file: {e}")

def cleanup_file(file_path):
    """Delete a file if it exists."""
    if os.path.exists(file_path):
        os.remove(file_path)
