const API_URL = "http://localhost:5000"; // Use server.py as the main backend

export const uploadAudio = async (audioFile) => {
    const formData = new FormData();
    formData.append("file", audioFile);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Upload failed: ${errorMessage}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
};

// New function to clone voice
export const cloneVoice = async (text, referenceAudio) => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("reference_audio", referenceAudio);

    try {
        const response = await fetch(`${API_URL}/clone-voice`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Voice cloning failed: ${errorMessage}`);
        }

        // Returns the audio file blob
        return await response.blob();
    } catch (error) {
        console.error("Voice cloning error:", error);
        return null;
    }
};
