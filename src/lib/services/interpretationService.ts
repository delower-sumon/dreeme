import fs from 'fs';
import path from 'path';

// ─── Prompt Loader ────────────────────────────────────────────────────────────

function loadSystemPrompt(): string {
  try {
    const p = path.join(process.cwd(), 'src', 'lib', 'prompts', 'FORMAT INSTRUCTIONS.txt');
    return fs.readFileSync(p, 'utf8');
  } catch {
    return "Interpret the following dream with empathy and insight. Focus on key symbols, emotional context, and provide a positive, grounded takeaway.";
  }
}

function buildUserPrompt(dreamText: string): string {
  return `${loadSystemPrompt()}

Dream to interpret:
"${dreamText}"

Respond with ONLY a valid JSON object — no markdown, no code blocks, no explanation:
{
  "opening": "1-2 sentences directly addressing 'you' — core emotion and key symbolism of your dream",
  "bullets": ["**Element:** One concise sentence addressing 'you' directly", "**Element:** One concise sentence addressing 'you' directly"],
  "closing": "One practical sentence for you, then one brief uplifting sentence about your path ahead."
}`;
}

function extractJSON(text: string) {
  // Remove markdown code fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error("No valid JSON in response");
}

// ─── Groq (Primary Interpretation Engine) ──────────────────────────────────────

async function interpretWithGroq(dreamText: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  console.log("🟢 Interpreting with Groq (llama-3.3-70b-versatile)...");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert AI dream interpreter for the Dreeme app. Always address the user directly as 'you' — never say 'the dreamer' or 'the user'. Keep interpretations short and personal. Respond with pure valid JSON only — no markdown, no code blocks, no preamble.",
        },
        {
          role: "user",
          content: buildUserPrompt(dreamText),
        },
      ],
      temperature: 0.75,
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    const error = Object.assign(new Error(`Groq API error: ${err}`), { status: response.status });
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");

  console.log(`✅ Groq succeeded (${data.usage?.total_tokens ?? '?'} tokens used)`);
  return extractJSON(content);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Primary function to interpret a dream using the optimized AI pipeline.
 * Currently uses Groq (Llama 3.3 70B) for high-speed, high-quality results.
 */
export async function interpretDream(dreamText: string) {
  return await interpretWithGroq(dreamText);
}
