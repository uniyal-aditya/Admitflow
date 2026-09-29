import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getColleges, getNotices } from "@/lib/services/admission";

const PROVIDERS: Record<string, { baseUrl: string; defaultModel: string }> = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  openai: { baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: "gemini-2.0-flash" },
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = (process.env.LLM_PROVIDER || "openrouter") as string;
  const modelName = process.env.LLM_MODEL || (PROVIDERS[provider]?.defaultModel || PROVIDERS.openrouter.defaultModel);
  const key = process.env.LLM_API_KEY || "";

  if (!key) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const colleges = await getColleges();
  const notices = await getNotices();

  const allColleges = colleges.map((c) =>
    `- ${c.name} (${c.shortName}): ${c.type}, ${c.ownership}, ${c.district}, est. ${c.established ?? "?"}, courses: ${c.courses.length}, fees range: ${c.courses.length ? Math.min(...c.courses.map(cr => cr.fees)) : "?"}-${c.courses.length ? Math.max(...c.courses.map(cr => cr.fees)) : "?"}, courses: [${c.courses.map(cr => `${cr.name}(${cr.fees})`).join(", ")}]`
  ).join("\n");

  const activeNotices = notices.filter((n) => n.status === "active");
  const noticeSample = activeNotices.map((n) =>
    `- ${n.title} (college: ${n.collegeId}, type: ${n.type}, published: ${n.publishedDate}, lastDate: ${n.lastDate || "N/A"})`
  ).join("\n");

  const prompt = `You are a data verification assistant. Review ALL of the following Uttarakhand college admission data and identify ANY incorrect or implausible information based on your knowledge.

## All Colleges (${colleges.length} total):
${allColleges}

## All Active Notices (${activeNotices.length} total):
${noticeSample}

## Verification Categories:
1. **College Data**: established years, ownership (govt/private), college types, fee ranges, course appropriateness
2. **Notice Data**: published dates (must be past), plausible content
3. **Timeline Data**: date ordering, stage sequence, current stage correctness

## Instructions:
- For EVERY item with an issue, include: { "id": "college-id", "item": "College Name - Field", "field": "field name", "issue": "description", "suggestedFix": "what it should be", "category": "college|notice|timeline", "dataPath": "colleges.X.name or notices.X.title" }
- Only flag items where you are confident there is an error
- Be thorough but conservative

Return JSON:
{
  "issues": [{ "id": string, "item": string, "field": string, "issue": string, "suggestedFix": string, "category": string, "dataPath": string }],
  "verifiedOk": number,
  "totalChecked": number,
  "sourcesChecked": string[],
  "lastVerified": "ISO date"
}`;

  try {
    const prov = PROVIDERS[provider] || PROVIDERS.openrouter;
    const client = createOpenAI({ baseURL: prov.baseUrl, apiKey: key, fetch: fetch as any });

    const { text } = await generateText({
      model: client(modelName),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    let parsed: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text, issues: [] };
    } catch {
      parsed = { raw: text, issues: [] };
    }

    return NextResponse.json({
      ...parsed,
      lastVerified: new Date().toISOString(),
      collegesChecked: colleges.length,
      noticesChecked: notices.length,
      timelinesChecked: 0,
    });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
