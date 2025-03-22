import os
import numpy as np
import librosa
from resemblyzer import VoiceEncoder, preprocess_wav

def extract_embedding(audio_path):
    # Verify the file exists
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Error: File not found - {audio_path}")

    # Check if the file is accessible
    if not os.access(audio_path, os.R_OK):
        raise PermissionError(f"Error: No read permission for file - {audio_path}")

    # Load and preprocess the audio file
    print(f"Loading audio file: {audio_path}")
    wav, sr = librosa.load(audio_path, sr=16000)
    wav = preprocess_wav(wav)

    # Extract speaker embedding
    encoder = VoiceEncoder()
    embedding = encoder.embed_utterance(wav)

    return embedding

if __name__ == "__main__":
    # Define absolute paths
    audio_path = "/Users/mac/voice-cloning-app/backend/uploads/original_speech.wav"
    embedding_path = "/Users/mac/voice-cloning-app/backend/uploads/speaker_embedding.npy"

    try:
        # Extract embedding
        embedding = extract_embedding(audio_path)

        # Ensure the output directory exists
        output_dir = os.path.dirname(embedding_path)
        os.makedirs(output_dir, exist_ok=True)

        # Save embedding
        np.save(embedding_path, embedding)
        print(f"Speaker embedding saved at: {embedding_path}")

    except Exception as e:
        print(f"Error: {e}")
