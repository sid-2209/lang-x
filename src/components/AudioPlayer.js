import React, { useEffect, useState } from "react";

const AudioPlayer = ({ audioBlob }) => {
    const [audioURL, setAudioURL] = useState(null);

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            setAudioURL(url);
            
            // Cleanup function to revoke the object URL
            return () => URL.revokeObjectURL(url);
        }
    }, [audioBlob]);

    if (!audioBlob) return null;

    return (
        <div>
            <audio controls>
                <source src={audioURL} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default AudioPlayer;
