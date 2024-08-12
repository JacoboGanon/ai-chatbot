"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hola, ¿en qué puedo ayudarte?",
    },
  ]);

  const [userMessage, setUserMessage] = useState("");

  const addMessage = () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: userMessage }]),
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader?.read().then(function processText({ done, value }): Promise<string> {
        if (done) {
          return Promise.resolve(result);
        }

        result += decoder.decode(value, { stream: true });
        setMessages((messages) => [...messages.slice(0, messages.length - 1), { role: "assistant", content: result }]);
        return reader.read().then(processText);
      });
    });

    setUserMessage("");
  };

  const checkKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addMessage();
    }
  };

  return (
    <main className="flex flex-col items-center">
      <h2 className="text-3xl font-semibold my-4">Chatbot</h2>
      <Card className="w-[600px] max-h-[800px] overflow-auto p-8 flex flex-col gap-y-4">
        <>
          {messages.map((message, index) => (
            <div key={index} className={`${message.role === "assistant" ? "mr-auto" : "ml-auto"} max-w-[300px]`}>
              <div
                className={`${message.role === "assistant" ? "bg-gray-100" : "bg-blue-400"} rounded-sm px-4 py-2 w-fit`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </>
        <div className="flex gap-x-4">
          <Input
            value={userMessage}
            onChange={(event) => setUserMessage(event.target.value)}
            onKeyUp={checkKeyPressed}
          />
          <Button onClick={addMessage}>Send</Button>
        </div>
      </Card>
    </main>
  );
}
