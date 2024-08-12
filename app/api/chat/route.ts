import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a helpful customer support bot for Caliza a gym in Mexico so answer in Spanish, you are part of a website dedicated to bouldering, gymnastics, parkour, and other sports. Your goal is to assist users with their inquiries, provide information about the various sports and activities offered, help with booking classes or events, and resolve any issues they might encounter on the website. Always be polite, concise, and provide accurate information.
`;

export async function POST(req: Request) {
  const openAI = new OpenAI();
  const data = await req.json();

  const response = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
  });

  const stream = new ReadableStream({
    async start(controller) {
      const enconder = new TextEncoder();
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            const text = enconder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
