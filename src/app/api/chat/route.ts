import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getSession } from "@/lib/auth";
import { getColleges, getNotices, getTimeline } from "@/lib/services/admission";

const PROVIDERS: Record<string, { baseUrl: string; defaultModel: string }> = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  openai: { baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: "gemini-2.0-flash" },
};

async function buildSystemPrompt(): Promise<string> {
  // Answer from the canonical DB (service layer) — statuses are engine-derived.
  const colleges = await getColleges();
  const notices = await getNotices();
  const timelines = await Promise.all(
    colleges.slice(0, 40).map(async (c) => ({ id: c.id, tl: await getTimeline(c.id) })),
  );
  const timelineById = Object.fromEntries(timelines.map((t) => [t.id, t.tl]));

  const govt = colleges.filter((c) => c.ownership === "government");
  const priv = colleges.filter((c) => c.ownership === "private" || c.ownership === "deemed");
  const activeNotices = notices.filter((n) => n.status === "active");
  const deadlines = activeNotices
    .filter((n) => n.lastDate)
    .sort((a, b) => new Date(a.lastDate!).getTime() - new Date(b.lastDate!).getTime());

  const collegeList = colleges.map((c) => {
    const tl = timelineById[c.id];
    const currentStage = tl?.stages.find((s) => s.status === "current" || s.status === "completed");
    return `\u2022 ${c.shortName} \u2014 ${c.location} (${c.type}, ${c.ownership}) \u2014 ${c.courses.length} programs \u2014 Website: ${c.website}${currentStage ? ` \u2014 Current: ${currentStage.label}` : ""}`;
  });

  return `You are AdmitFlow AI, a helpful assistant for Uttarakhand college admissions. Answer concisely and accurately using the data below.

## Colleges (${colleges.length} total)
${collegeList.join("\n")}

## Active Notices (${activeNotices.length})
${activeNotices.slice(0, 15).map((n) => {
  const c = colleges.find((cl) => cl.id === n.collegeId);
  return `\u2022 ${n.title} \u2014 ${c?.shortName || n.collegeId} (${n.type}) \u2014 Deadline: ${n.lastDate || "N/A"}`;
}).join("\n")}

## Upcoming Deadlines
${deadlines.slice(0, 10).map((n) => {
  const c = colleges.find((cl) => cl.id === n.collegeId);
  return `\u2022 ${n.title} \u2014 ${c?.shortName || n.collegeId} \u2014 Due: ${n.lastDate}`;
}).join("\n")}

## Government Colleges: ${govt.length} | Private/Deemed: ${priv.length}

Keep answers short, specific, and cite data. If you don't know something, say so. Direct users to /colleges or /notices for more details.`;
}

export async function POST(req: NextRequest) {
  try {
    // LLM calls cost real money — restrict to signed-in users (the chat UI
    // only renders post-login; middleware rate limiting still applies).
    const session = await getSession();
    if (!session?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const provider = (process.env.LLM_PROVIDER || "openrouter") as string;
    const modelName = process.env.LLM_MODEL || (PROVIDERS[provider]?.defaultModel || PROVIDERS.openrouter.defaultModel);
    const key = process.env.LLM_API_KEY || "";

    if (!key) {
      return Response.json({
        message: "AI assistant is not configured. The server administrator needs to set LLM_API_KEY in the environment variables.",
      });
    }

    const prov = PROVIDERS[provider] || PROVIDERS.openrouter;
    const client = createOpenAI({ baseURL: prov.baseUrl, apiKey: key });

    const systemPrompt = await buildSystemPrompt();

    const result = streamText({
      model: client(modelName),
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("Chat error:", err);
    const status = err.status || 500;
    const detail = err.message || err.statusText || "unknown";
    const msg = status === 401
      ? "Invalid API key. Contact the server administrator."
      : status === 429
        ? "Rate limited. Try again in a moment."
        : `AI service error (${status}): ${detail}`;
    return Response.json({ message: msg }, { status: 200 });
  }
}
