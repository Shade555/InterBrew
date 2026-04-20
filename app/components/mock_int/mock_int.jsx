"use client";
import { useState, useEffect, useRef } from "react";
import { useSpeech } from "./useSpeech";
import { supabase } from "../../../lib/supabaseClient";
import tryIncrementStreak from "../../../lib/streak";

  // helper to log TTS errors but silently ignore cancellations/interrupts
  function logTtsError(e) {
    try {
      const msg = e?.message ?? String(e);
      if (/interrupt|interrupted|cancel|aborted?/i.test(msg)) return;
      console.error("TTS error:", msg);
    } catch (err) {
      console.error("TTS error:", err);
    }
  }

export default function MockInterviewPanel({ difficulty, onClose, topic }) {
  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);
  const [status, setStatus] = useState("Ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const finishedRef = useRef(false);
  const systemPromptRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [favAdded, setFavAdded] = useState([]);
  const awaitingCloseRef = useRef(false);
  const mouseDownRef = useRef(false);

  async function addToFavourites(question) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('Not signed in');

      const { data, error } = await supabase.from('user_dashboards').select('favourite_questions').eq('user_id', userId).single();
      if (error) {
        console.error('Failed to fetch dashboard row', error);
        return false;
      }
      const favs = Array.isArray(data?.favourite_questions) ? data.favourite_questions : [];
      if (favs.includes(question)) {
        setFavAdded((s) => [...s, question]);
        return true;
      }
      const newFavs = [...favs, question];
      const { error: upErr } = await supabase.from('user_dashboards').update({ favourite_questions: newFavs }).eq('user_id', userId);
      if (upErr) {
        console.error('Failed to update favourites', upErr);
        return false;
      }
      try { window.dispatchEvent(new CustomEvent('favourites:updated', { detail: { question } })); } catch (e) {}
      setFavAdded((s) => [...s, question]);
      return true;
    } catch (e) {
      console.error('addToFavourites error', e);
      return false;
    }
  }

  // Initialize our custom speech hook
  const { isListening, startListening, stopListening, speak, stopSpeaking } = useSpeech(async (userText) => {
    // 1. User stopped talking, we got the text
    setStatus("Thinking...");

    try {
      // 2. Send text to our Next.js backend (API will add message to history)
        const res = await fetch("/api/mock_int", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText, history: historyRef.current, system: systemPromptRef.current }),
        });

      const data = await res.json();

      // Check for API errors
      if (!res.ok || data.error) {
        console.error("API error:", data.error || res.statusText);
        setStatus("Error: API failed");
        setHistory((prev) => {
          const next = [...prev, { role: "user", content: userText }, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }];
          historyRef.current = next;
          return next;
        });
        return;
      }

      // 3. AI replied. Prefer structured JSON: { message: string, end: boolean }
      let assistantReplyRaw = data.reply || "";
      console.log("API Response:", { reply: assistantReplyRaw, isComplete: data.isComplete });
      let assistantMessage = assistantReplyRaw;
      let isEnd = false || data.isComplete;

      try {
        // Try direct parse
        const parsed = JSON.parse(assistantReplyRaw);
        if (parsed && typeof parsed.message === "string" && parsed.message.trim().length > 0) {
          assistantMessage = parsed.message;
          isEnd = !!parsed.end || isEnd;
        }
      } catch (e) {
        // Try to extract JSON substring
        const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            // Only use JSON if message is substantial (not empty or just "take your time")
            if (parsed && typeof parsed.message === "string" && parsed.message.trim().length > 20) {
              assistantMessage = parsed.message;
              isEnd = !!parsed.end || isEnd;
            } else {
              // If JSON message is empty or too short, extract all text before the JSON
              const textBeforeJson = assistantReplyRaw.substring(0, jsonMatch.index).trim();
              if (textBeforeJson.length > 0) {
                assistantMessage = textBeforeJson;
              } else {
                assistantMessage = assistantReplyRaw.replace(jsonMatch[0], "").trim();
              }
              isEnd = parsed && !!parsed.end ? true : isEnd;
            }
          } catch (e2) {
            // keep raw response
          }
        }
      }

      // Ensure we have a message
      if (!assistantMessage || assistantMessage.trim() === "") {
        assistantMessage = "I'm thinking... could you rephrase that?";
      }

      // fallback heuristics: trim multiple questions to first
      if (!isEnd) {
        const questionMarks = (assistantMessage.match(/\?/g) || []).length;
        if (questionMarks > 1) {
          const firstQ = assistantMessage.indexOf("?");
          assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
        }
      }

      // Detect if assistant asked the closing question and append reply to history
      const closingQuestionRegex = /do you have any questions for me|any questions for me|do you have any questions\?/i;
      if (closingQuestionRegex.test(assistantMessage)) {
        awaitingCloseRef.current = true;
      }

      setHistory((prev) => {
        const next = [...prev, { role: "user", content: userText }, { role: "assistant", content: assistantMessage }];
        historyRef.current = next;
        return next;
      });
      setStatus("Ready");

      if (isEnd && !finishedRef.current) {
        // If assistant incorrectly marked end while asking for candidate questions,
        // treat it as non-final and wait for candidate reply.
        if (awaitingCloseRef.current && closingQuestionRegex.test(assistantMessage)) {
          try {
            speak(assistantMessage).catch((e) => logTtsError(e));
          } catch (e) {
            logTtsError(e);
          }
          // do not close yet
        } else {
          finishedRef.current = true;
          try {
            await speak(assistantMessage);
          } catch (e) {
            logTtsError(e);
          }
          // Increment streak once per day for completing a mock interview
          try { await tryIncrementStreak(); } catch (e) { /* ignore */ }
          // stop any TTS immediately and close
          try { stopSpeaking?.(); } catch (e) {}
          onClose?.();
        }
      } else {
        // speak but don't await for non-final replies
        speak(assistantMessage).catch((e) => logTtsError(e));
        if (/\?/m.test(assistantMessage)) setQuestionIndex((q) => q + 1);
      }

    } catch (error) {
      console.error(error);
      setStatus("Error fetching response.");
    }
  });

  // helper to start interview by requesting the first question
  async function startInterview() {
    setStatus("Thinking...");
    setStarted(true);
    // Instruct the model to behave like a human interviewer and prefer JSON output when possible
    const systemPrompt = `You are a professional technical interviewer. Behave like a human interviewer: greet the candidate (e.g. "Good morning/afternoon"), be conversational, and ask clear technical questions. When possible return a JSON object with shape: {"message":"...", "end": false|true}.\n\n1) Start with a short greeting ("Good morning/afternoon — thanks for joining. How are you today?" or similar).\n2) Ask one technical question at a time appropriate for the "${difficulty}" difficulty${topic ? ` about the topic: ${topic}` : ""}.\n3) After the user's answer, provide a brief constructive comment or correction (1-2 sentences), then ask the next question.\n4) After two technical questions and corrections, ask a closing transitional question such as: "Do you have any questions for me about the role or the interview?" Then provide a short closing remark and set \"end\": true.\n5) Use natural interviewer phrasing ("Can you walk me through your thought process?", "Take your time", "Any questions for me?").\n\nIf you cannot reliably output strict JSON, put the interviewer text in the message field and set end accordingly.`;
    systemPromptRef.current = systemPrompt;

    try {
      const res = await fetch("/api/mock_int", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "__start__", history: historyRef.current, system: systemPromptRef.current }),
      });
      const data = await res.json();

      // Check for API errors
      if (!res.ok || data.error) {
        console.error("API error:", data.error || res.statusText);
        setStatus("Error: Failed to start interview");
        return;
      }

      let assistantReplyRaw = data.reply || "";
      let assistantMessage = assistantReplyRaw;
      let isEnd = false || data.isComplete;
      try {
        const parsed = JSON.parse(assistantReplyRaw);
        if (parsed && typeof parsed.message === "string" && parsed.message.trim().length > 0) {
          assistantMessage = parsed.message;
          isEnd = !!parsed.end || isEnd;
        }
      } catch (e) {
        const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            // Only use JSON if message is substantial (not empty or too short)
            if (parsed && typeof parsed.message === "string" && parsed.message.trim().length > 20) {
              assistantMessage = parsed.message;
              isEnd = !!parsed.end || isEnd;
            } else {
              // If JSON message is empty or too short, extract all text before the JSON
              const textBeforeJson = assistantReplyRaw.substring(0, jsonMatch.index).trim();
              if (textBeforeJson.length > 0) {
                assistantMessage = textBeforeJson;
              } else {
                assistantMessage = assistantReplyRaw.replace(jsonMatch[0], "").trim();
              }
              isEnd = parsed && !!parsed.end ? true : isEnd;
            }
          } catch (e2) {}
        }
      }

      // Ensure we have a message
      if (!assistantMessage || assistantMessage.trim() === "") {
        assistantMessage = "Hello, and thanks for joining. How are you today?";
      }

      // fallback: trim multiple questions to first
      if (!isEnd) {
        const questionMarks = (assistantMessage.match(/\?/g) || []).length;
        if (questionMarks > 1) {
          const firstQ = assistantMessage.indexOf("?");
          assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
        }
      }
      const closingQuestionRegex = /do you have any questions for me|any questions for me|do you have any questions\?/i;
      if (closingQuestionRegex.test(assistantMessage)) {
        awaitingCloseRef.current = true;
      }

      setHistory((h) => {
        // Add a placeholder user message first, then the assistant greeting
        // This ensures proper alternating user/assistant message structure for Groq
        const next = [
          { role: "user", content: "__greeting_request__" },
          { role: "assistant", content: assistantMessage }
        ];
        historyRef.current = next;
        return next;
      });
      setStatus("Ready");
      if (isEnd && !finishedRef.current) {
        if (awaitingCloseRef.current && closingQuestionRegex.test(assistantMessage)) {
          // assistant asked for candidate questions but set end: wait for user's reply
          try {
            speak(assistantMessage).catch((e) => logTtsError(e));
          } catch (e) {
            logTtsError(e);
          }
        } else {
          finishedRef.current = true;
          try {
            await speak(assistantMessage);
          } catch (e) {
            logTtsError(e);
          }
          // Increment streak once per day for completing a mock interview
          try { await tryIncrementStreak(); } catch (e) { /* ignore */ }
          // stop any speech then close
          try { stopSpeaking?.(); } catch (e) {}
          onClose?.();
        }
      } else {
        speak(assistantMessage).catch((e) => logTtsError(e));
      }
    } catch (err) {
      console.error(err);
      setStatus("Error starting interview");
    }
  }

  useEffect(() => {
    // start is manual now; do not auto-start on mount
     
  }, []);

  useEffect(() => {
    // ensure we stop any speech when this component unmounts
    return () => {
      try { stopSpeaking?.(); } catch (e) {}
      try { stopListening(); } catch (e) {}
    };
  }, []);

  useEffect(() => {
    // Global mouseUp handler to catch releases outside the button
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current && isListening) {
        mouseDownRef.current = false;
        stopListening();
      }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isListening]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => { try { stopSpeaking?.(); } catch (e) {} ; onClose?.(); }} />
      <div className="relative p-6 rounded-lg bg-transparent recommended-card max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold">AI Mock Interview{difficulty ? ` — ${difficulty}` : ""}</h2>
          <button onClick={() => { try { stopSpeaking?.(); } catch (e) {} ; onClose?.(); }} className="px-3 py-1 rounded-md bg-white/10">Close</button>
        </div>
      
      <div className="flex items-center gap-4 mb-6">
        {!started ? (
          <button
            onClick={() => startInterview()}
            className={`px-6 py-3 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700`}
          >
            Start Interview
          </button>
        ) : (
            <>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                mouseDownRef.current = true;
                // Stop any TTS immediately before starting user speech
                try { stopSpeaking?.(); } catch (e) {}
                startListening();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                mouseDownRef.current = false;
                stopListening();
              }}
              onContextMenu={(e) => e.preventDefault()}
              aria-pressed={isListening}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all select-none ${
                isListening ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isListening ? "Listening... (release to stop)" : "Hold to Speak"}
            </button>
          </>
        )}
        <span className="text-gray-600 font-medium">Status: {status}</span>
      </div>

      <div className="bg-white/5 p-4 rounded-md h-64 overflow-y-auto border border-white/10 scrollbar-hide">
        {history.length === 0 ? (
          <p className="text-gray-400 italic">Conversation will appear here...</p>
        ) : (
          history
            .filter(msg => msg.content !== "__greeting_request__")
            .map((msg, index) => (
            <div key={index} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block p-2 rounded-lg ${
                msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
              }`}>
                <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
                {msg.content}
              </span>
              {msg.role === "assistant" && (
                <button
                  onClick={async (e) => { e.stopPropagation(); await addToFavourites(msg.content); }}
                  className={`ml-2 text-lg px-1 py-0.5 rounded ${favAdded.includes(msg.content) ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
                  aria-label="Add to favourites"
                >
                  {favAdded.includes(msg.content) ? '★' : '☆'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}