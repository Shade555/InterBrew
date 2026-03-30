"use client";
import { useState, useEffect, useRef } from "react";

export function useSpeech(onTextExtracted) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const speakingRef = useRef(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTextExtracted(transcript); // Send text back to UI
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [onTextExtracted]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.speechSynthesis) {
          return reject(new Error('SpeechSynthesis API not available'));
        }
        // Cancel any ongoing speech before starting a new one
        try { window.speechSynthesis.cancel(); } catch (e) {}
        speakingRef.current = true;
        const utterance = new SpeechSynthesisUtterance(text);
        // Optional: tweak voice settings here (pitch, rate, specific voices)
        utterance.rate = 1.0;
        utterance.onend = () => {
          speakingRef.current = false;
          resolve();
        };
        utterance.onerror = (ev) => {
          speakingRef.current = false;
          // Normalize to an Error with useful text so callers get readable messages
          const msg = (ev && (ev.error || ev.type)) ? String(ev.error || ev.type) : 'unknown speech synthesis error';
          reject(new Error('SpeechSynthesisUtterance error: ' + msg));
        };
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          speakingRef.current = false;
          reject(new Error('speechSynthesis.speak threw: ' + (e?.message ?? e)));
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  const stopSpeaking = () => {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    speakingRef.current = false;
  };

  return { isListening, startListening, stopListening, speak, stopSpeaking };
}