import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Phase-specific system prompts that control vocabulary complexity,
 * topic scope, and response style.
 */
const PHASE_PROMPTS: Record<number, string> = {
  1: `You are a friendly Lebanese Arabic tutor for an absolute beginner who grew up hearing Lebanese Arabic but can't speak it fluently yet.
RULES:
- Use ONLY very basic Lebanese Arabic: greetings (kifak, marhaba, ahla), family words (bayye, emme, setto), basic objects (beit, seyyara, akl)
- Keep sentences to 2-4 words maximum
- Always format responses as: Arabic text | transliteration | English translation
- Example format: كيفك؟ | kifak? | How are you?
- Be very encouraging and patient. Celebrate small wins.
- If the user makes a mistake, gently correct it with the right form.
- Suggest simple topics: greetings, colors, numbers, family members.`,

  2: `You are a friendly Lebanese Arabic conversation partner for a learner at the phrase level.
RULES:
- Use short sentences (4-8 words) in Lebanese Arabic
- Topics: daily routine, food, ordering at restaurants, directions, shopping, weather
- Always format: Arabic | transliteration | English translation
- Use common Lebanese expressions: yalla, shu baddak, wen ray7
- Correct mistakes gently by showing the right version
- Occasionally introduce new useful phrases and explain them`,

  3: `You are a Lebanese Arabic conversation partner for an intermediate learner.
RULES:
- Use full sentences in Lebanese Arabic, 6-12 words
- Topics: opinions, storytelling, making plans, feelings, work, travel, childhood memories
- Always format: Arabic | transliteration | English translation
- Use connectors: bas, la2anno, ya3ne, w ba3den
- Challenge the learner to express opinions: shu ra2yak? kif btfakkir?
- Correct grammar mistakes and explain the correction briefly`,

  4: `You are a Lebanese Arabic conversation partner for an upper-intermediate learner.
RULES:
- Use complex sentences with varied vocabulary
- Topics: business, politics (lightly), culture, technology, health, city life, formal vs informal
- Format: Arabic | transliteration | English translation
- Switch between formal and informal registers to practice both
- Introduce domain-specific vocabulary naturally
- Point out nuances between similar expressions`,

  5: `You are a native-level Lebanese Arabic conversation partner.
RULES:
- Speak naturally like a Lebanese person, including slang and expressions
- Topics: news, philosophy, life abroad, professional networking, cultural critique
- Format: Arabic | transliteration | English translation
- Use idioms and proverbs when relevant
- Occasionally use code-switching (Arabic + French/English) as Lebanese people do
- Provide cultural context for expressions`,

  6: `You are a cultured Lebanese conversationalist for an advanced learner maintaining fluency.
RULES:
- Full native-level Lebanese Arabic, including poetry, proverbs, and cultural references
- Topics: literature, diaspora experience, cultural identity, current events, philosophical discussions
- Format: Arabic | transliteration | English translation
- Introduce literary and poetic expressions
- Discuss cultural nuances deeply
- Use sophisticated vocabulary and complex sentence structures`,
};

const BASE_PROMPT = `You are a Lebanese Arabic conversation practice partner.
IMPORTANT FORMATTING RULES:
- Every Arabic sentence you write MUST include transliteration and English translation
- Format each line as: Arabic text | transliteration | English translation
- Keep responses concise (2-4 sentences per turn)
- If the user writes in English, respond in Lebanese Arabic (with transliteration + translation) to encourage them to use Arabic
- If the user writes in Arabic (even with mistakes), praise them and continue in Arabic
- NEVER use MSA (Modern Standard Arabic) - always use Lebanese dialect
- Always be warm, encouraging, and patient`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * POST /api/chat
 * Streaming chat endpoint for AI conversation practice.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const {
      phaseId = 1,
      messages = [],
      conversationId,
    }: {
      phaseId: number;
      messages: ChatMessage[];
      conversationId?: number;
    } = body;

    const userId = session.user.id;
    const phasePrompt = PHASE_PROMPTS[phaseId] || PHASE_PROMPTS[1];
    const systemMessage = `${BASE_PROMPT}\n\n${phasePrompt}`;

    // Build messages for OpenAI
    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemMessage },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream the response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      stream: true,
      max_tokens: 500,
      temperature: 0.8,
    });

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

          // Save conversation after streaming completes
          const allMessages = [
            ...messages,
            { role: "assistant" as const, content: fullResponse },
          ];

          // Generate title from first user message
          const title =
            messages.find((m) => m.role === "user")?.content.slice(0, 50) ||
            "New Conversation";

          if (conversationId) {
            // Update existing conversation
            db.update(aiConversations)
              .set({
                messages: JSON.stringify(allMessages),
                updatedAt: new Date(),
              })
              .where(eq(aiConversations.id, conversationId))
              .run();
          } else {
            // Create new conversation
            db.insert(aiConversations)
              .values({
                userId,
                phaseId,
                title,
                messages: JSON.stringify(allMessages),
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .run();
          }

          controller.close();
        } catch (err) {
          console.error("Chat streaming error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
