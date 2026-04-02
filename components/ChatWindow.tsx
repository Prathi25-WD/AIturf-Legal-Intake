"use client";
import { useState } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaskara! Welcome to K.T. Dakappa & Associates. I'm here to help you tell us about your legal matter. Please describe your situation in your own words." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.message }]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800">K.T. Dakappa & Associates</h1>
        <p className="text-sm text-gray-500">Powered by AITurf | This is not legal advice</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${
            m.role === "user"
              ? "bg-blue-100 ml-auto text-right"
              : "bg-gray-100 mr-auto"
          }`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="bg-gray-100 p-3 rounded-lg max-w-[85%]">Typing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-3 outline-none focus:border-blue-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Describe your legal matter here..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}
