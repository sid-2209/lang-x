import React, { useState } from "react";
import Recorder from "../components/Recorder";
import AudioPlayer from "../components/AudioPlayer";
import { uploadAudio } from "../api";
import { Container, Typography, Button, CircularProgress, Box } from "@mui/material";

const Home = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleTranscriptionComplete = (blob) => {
        setAudioBlob(blob);
    };

    const handleUpload = async () => {
        if (!audioBlob) return;
        setUploading(true);
        setUploadMessage("");

        try {
            const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
            const response = await uploadAudio(audioFile);

            if (response.path) {
                setUploadMessage("✅ Upload successful!");
            } else {
                setUploadMessage("❌ Upload failed.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadMessage("❌ Upload error.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Voice Cloning App
            </Typography>

            <Recorder onTranscription={handleTranscriptionComplete} />
            <AudioPlayer audioBlob={audioBlob} />

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!audioBlob || uploading}
                    sx={{ minWidth: 150 }}
                >
                    {uploading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Upload Audio"}
                </Button>
            </Box>

            {uploadMessage && (
                <Typography variant="body1" sx={{ mt: 2, color: uploadMessage.includes("✅") ? "green" : "red" }}>
                    {uploadMessage}
                </Typography>
            )}
        </Container>
    );
};

export default Home;
