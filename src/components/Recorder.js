import React, { useState, useRef, useEffect } from "react";
import { Button, CircularProgress, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = "http://192.168.0.100:5000"; // 🔥 Updated API base URL

const Recorder = ({ onTranscription }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState("");
    const [transcription, setTranscription] = useState("");
    const [translations, setTranslations] = useState({ Spanish: "", French: "", Mandarin: "" });
    const [ttsAudio, setTtsAudio] = useState({});
    const [transcribing, setTranscribing] = useState(false);
    const [translating, setTranslating] = useState(false);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            setAudioURL(url);
            sendAudioForTranscription(audioBlob);
        }
    }, [audioBlob]);

    // 🔥 Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (audioURL) URL.revokeObjectURL(audioURL);
        };
    }, [audioBlob]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = () => {
                if (audioChunks.current.length === 0) return; // 🔥 Prevents empty recordings
                const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
                setAudioBlob(audioBlob);
            };

            mediaRecorder.current.start();
            setRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Microphone access denied!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            setRecording(false);
        }
    };

    const sendAudioForTranscription = async (blob) => {
        setTranscribing(true);
        const formData = new FormData();
        formData.append("file", blob, "audio.wav");

        try {
            const response = await fetch(`${API_BASE_URL}/transcribe`, { // 🔥 Updated URL
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setTranscription(data.transcription);
                onTranscription(data.transcription);
                toast.success("Transcription successful!");
                translateText(data.transcription);
            } else {
                toast.error("Failed to transcribe audio!");
            }
        } catch (error) {
            toast.error("Error sending audio for transcription.");
            console.error("Transcription Error:", error);
        } finally {
            setTranscribing(false);
        }
    };

    const translateText = async (text) => {
        setTranslating(true);
        const languages = { es: "Spanish", fr: "French", zh: "Mandarin" };
        let newTranslations = {};

        for (const [code, lang] of Object.entries(languages)) {
            try {
                const response = await fetch(`${API_BASE_URL}/translate`, { // 🔥 Updated URL
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, language: code }),
                });

                if (response.ok) {
                    const data = await response.json();
                    newTranslations[lang] = data.translated_text;
                } else {
                    toast.error(`Failed to translate to ${lang}!`);
                }
            } catch (error) {
                toast.error(`Error translating to ${lang}!`);
                console.error(`Translation Error (${lang}):`, error);
            }
        }

        setTranslations(newTranslations);
        setTranslating(false);
    };

    const generateSpeech = async (text, language) => {
        if (!text) return;
        try {
            const response = await fetch(`${API_BASE_URL}/synthesize`, { // 🔥 Updated URL to /synthesize
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, language }), // 🔥 Kept language parameter
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                setTtsAudio((prev) => ({ ...prev, [language]: audioUrl }));
                toast.success(`Speech generated for ${language}!`);
            } else {
                toast.error(`Failed to generate speech for ${language}!`);
            }
        } catch (error) {
            toast.error(`Error generating speech for ${language}!`);
            console.error(`TTS Error (${language}):`, error);
        }
    };

    const handleAudioUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioBlob(file);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const downloadTranslation = (text, language) => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `translation_${language}.txt`;
        document.body.appendChild(element);
        element.click();
        toast.info("Download started!");
    };

    return (
        <Box className="recorder" sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="h5">Voice Recorder</Typography>

            <Button
                variant="contained"
                color={recording ? "error" : "primary"}
                onClick={recording ? stopRecording : startRecording}
                sx={{ mt: 2 }}
            >
                {recording ? "🛑 Stop Recording" : "🎤 Start Recording"}
            </Button>

            <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: "block", margin: "10px auto" }} />

            {audioURL && (
                <Box className="audio-container" sx={{ mt: 2 }}>
                    <Typography variant="h6">Recorded Audio:</Typography>
                    <audio controls src={audioURL}></audio>
                </Box>
            )}

            <Box className="transcription" sx={{ mt: 3 }}>
                <Typography variant="h6">Transcription:</Typography>
                {transcribing ? <CircularProgress size={24} /> : <Typography>{transcription || "No transcription available"}</Typography>}
            </Box>

            <Box className="translations" sx={{ mt: 3 }}>
                <Typography variant="h6">Translations:</Typography>
                {translating ? (
                    <CircularProgress size={24} />
                ) : (
                    ["Spanish", "French", "Mandarin"].map((lang) => (
                        <Box key={lang} sx={{ mt: 2 }}>
                            <Typography><strong>{lang}:</strong> {translations[lang] || "No translation available"}</Typography>
                            {translations[lang] && (
                                <Box sx={{ mt: 1 }}>
                                    <Button onClick={() => copyToClipboard(translations[lang])}>📋 Copy</Button>
                                    <Button onClick={() => downloadTranslation(translations[lang], lang)}>⬇ Download</Button>
                                    <Button onClick={() => generateSpeech(translations[lang], lang)}>🔊 Generate Speech</Button>
                                </Box>
                            )}
                            {ttsAudio[lang] && <audio controls src={ttsAudio[lang]}></audio>}
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Recorder;
