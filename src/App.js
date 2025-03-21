import React, { useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Recorder from "./components/Recorder";
import {
    Box, CssBaseline, CircularProgress, LinearProgress, Button, MenuItem,
    Select, Typography, Switch
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { ThemeProvider } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://192.168.0.100:5000"; // Ensure correct API URL
const drawerWidth = 240;

function App({ darkMode, setDarkMode }) {
    const [transcription, setTranscription] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ upload: 0, speech: 0 });
    const [speechGenerating, setSpeechGenerating] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("es");

    // Toggle Dark Mode
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    };

    // Handle Translation
    const handleTranslate = async () => {
        if (!transcription) {
            toast.warning("No transcription available!");
            return;
        }

        setLoading(true);
        toast.info("Translation in progress...");

        try {
            const response = await fetch(`${API_URL}/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: transcription, language: selectedLanguage }),
            });

            if (response.ok) {
                const data = await response.json();
                setTranslatedText(data.translated_text);
                toast.success("Translation successful!");
            } else {
                toast.error("Translation failed! Please try again.");
            }
        } catch (error) {
            toast.error("Translation failed! Please try again.");
            console.error("Translation Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText);
        toast.success("Copied to clipboard!");
    };

    const downloadTranslation = () => {
        if (!translatedText) return;
        const element = document.createElement("a");
        const file = new Blob([translatedText], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "translated_text.txt";
        document.body.appendChild(element);
        element.click();
        toast.info("Download started!");
    };

    return (
        <CssBaseline>
            <ToastContainer position="top-right" autoClose={3000} />
            <Box sx={{ display: "flex" }}>
                <Sidebar />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        ml: { sm: `${drawerWidth}px` },
                        pt: 3, // Ensure proper spacing below the toolbar
                    }}
                >
                    {/* Dark Mode Toggle */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 2 }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                            {darkMode ? "Dark Mode" : "Light Mode"}
                        </Typography>
                        <Switch checked={darkMode} onChange={toggleDarkMode} />
                    </Box>

                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route
                            path="/recorder"
                            element={
                                <Recorder
                                    onTranscription={setTranscription}
                                    setUploadProgress={(value) => setProgress((prev) => ({ ...prev, upload: value }))}
                                    setSpeechGenerating={setSpeechGenerating}
                                    setSpeechProgress={(value) => setProgress((prev) => ({ ...prev, speech: value }))}
                                />
                            }
                        />
                        <Route
                            path="/translations"
                            element={
                                <Box className="translation-container" sx={{ textAlign: "center" }}>
                                    <Typography variant="h5" gutterBottom>
                                        Live Transcription
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {transcription || "No transcription yet..."}
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1">Select Language:</Typography>
                                        <Select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            sx={{ minWidth: 200 }}
                                        >
                                            <MenuItem value="es">Spanish</MenuItem>
                                            <MenuItem value="fr">French</MenuItem>
                                            <MenuItem value="zh">Mandarin</MenuItem>
                                        </Select>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleTranslate}
                                        disabled={!transcription || loading}
                                        sx={{ mt: 2 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Translate"}
                                    </Button>

                                    {/* Progress Bar */}
                                    {loading && <LinearProgress sx={{ mt: 2 }} />}

                                    {translatedText && (
                                        <Box className="translated-text" sx={{ mt: 3 }}>
                                            <Typography variant="h5">Translated Text</Typography>
                                            <Typography variant="body1" sx={{ my: 2 }}>
                                                {translatedText}
                                            </Typography>
                                            <Button variant="outlined" onClick={copyToClipboard} sx={{ mr: 1 }}>
                                                Copy
                                            </Button>
                                            <Button variant="outlined" onClick={downloadTranslation}>
                                                Download
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            }
                        />

                        {/* Fallback Route (404) */}
                        <Route path="*" element={<Typography variant="h4">Page Not Found</Typography>} />
                    </Routes>

                    {/* Progress Indicators */}
                    {progress.upload > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1">File Upload Progress</Typography>
                            <LinearProgress variant="determinate" value={progress.upload} />
                        </Box>
                    )}

                    {speechGenerating && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1">Speech Generation Progress</Typography>
                            <LinearProgress variant="determinate" value={progress.speech} />
                        </Box>
                    )}
                </Box>
            </Box>
        </CssBaseline>
    );
}

export default App;
