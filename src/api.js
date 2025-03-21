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
            const errorMessage = await response.text(); // Get error message from backend
            throw new Error(`Upload failed: ${errorMessage}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
};
