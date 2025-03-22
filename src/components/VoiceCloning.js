import React, { useState } from "react";
import { cloneVoice } from "../api";
import AudioPlayer from "./AudioPlayer";

const VoiceCloning = () => {
    const [text, setText] = useState("");
    const [referenceAudio, setReferenceAudio] = useState(null);
    const [clonedAudio, setClonedAudio] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAudioChange = (event) => {
        const file = event.target.files[0];
        setReferenceAudio(file);
    };

    const handleVoiceCloning = async () => {
        if (!text || !referenceAudio) {
            alert("Please enter text and upload a reference audio file.");
            return;
        }

        setLoading(true);
        const audioBlob = await cloneVoice(text, referenceAudio);
        setLoading(false);

        if (audioBlob) {
            setClonedAudio(audioBlob);
        } else {
            alert("Voice cloning failed. Please try again.");
        }
    };

    return (
        <div>
            <h2>Voice Cloning</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text for voice cloning..."
                rows="3"
                style={{ width: "100%" }}
            />
            <input type="file" accept="audio/*" onChange={handleAudioChange} />
            <button onClick={handleVoiceCloning} disabled={loading}>
                {loading ? "Cloning Voice..." : "Clone Voice"}
            </button>

            {clonedAudio && <AudioPlayer audioBlob={clonedAudio} />}
        </div>
    );
};

export default VoiceCloning;
