import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { colleges, collegeTimelines } from "@/data/colleges";
import { notices } from "@/data/notices";
import { getComputedStatus } from "@/lib/utils";

const PROVIDERS: Record<string, { baseUrl: string; defaultModel: string }> = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  openai: { baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: "gemini-2.0-flash" },
};

export async function GET() {
  const provider = (process.env.LLM_PROVIDER || "openrouter") as string;
  const modelName = process.env.LLM_MODEL || (PROVIDERS[provider]?.defaultModel || PROVIDERS.openrouter.defaultModel);
  const key = process.env.LLM_API_KEY || "";

  if (!key) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const sampleColleges = colleges.slice(0, 8).map((c) =>
    `- ${c.name} (${c.shortName}): ${c.type}, ${c.ownership}, ${c.district}, est. ${c.established}, courses: ${c.courses.length}, fees range: ${Math.min(...c.courses.map(cr => cr.fees))}-${Math.max(...c.courses.map(cr => cr.fees))}`
  ).join("\n");

  const activeNotices = notices.filter((n) => getComputedStatus(n) === "active").slice(0, 5);
  const noticeSample = activeNotices.map((n) =>
    `- ${n.title} (college: ${n.collegeId}, type: ${n.type}, published: ${n.publishedDate}, lastDate: ${n.lastDate || "N/A"})`
  ).join("\n");

  const timelineSample = Object.entries(collegeTimelines).slice(0, 3).map(([id, tl]) =>
    `- ${id}: currentStage=${tl.currentStage}, stages=${tl.stages.length}`
  ).join("\n");

  const prompt = `You are a data verification assistant. Review the following Uttarakhand college admission data and identify ANY incorrect or implausible information based on your knowledge.

## Colleges (sample):
${sampleColleges}

## Active Notices (sample):
${noticeSample}

## Timelines (sample):
${timelineSample}

## Instructions:
1. Check if established years match known facts
2. Check if ownership (govt/private) is correct
3. Check if college types (university/engineering/medical etc.) are correct
4. Check if fee ranges seem realistic
5. Check if course offerings seem appropriate for the college type
6. Check if timeline dates are plausible for 2026

Return a JSON object with:
{
  "issues": [{ "item": "college/notice/timeline name", "field": "field name", "issue": "description of problem", "suggestedFix": "what it should be" }],
  "verifiedOk": number of items verified without issues,
  "sourcesChecked": ["source1", "source2"],
  "lastVerified": "ISO date"
}
Only flag items where you are confident there is an error. Be conservative.`;

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
      timelinesChecked: Object.keys(collegeTimelines).length,
    });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
