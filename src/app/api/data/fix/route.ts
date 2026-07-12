import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

function patchStaticFile(category: string, id: string, field: string, value: string): boolean {
  const filename = category === "college" ? "colleges.ts" : "notices.ts";
  const filePath = path.join(process.cwd(), "src", "data", filename);
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, "utf-8");

  const objStartMarker = `id: "${id}"`;
  const objStartIdx = content.indexOf(objStartMarker);
  if (objStartIdx === -1) return false;

  const objEndIdx = content.indexOf("};", objStartIdx);
  if (objEndIdx === -1) return false;

  const objBlock = content.slice(objStartIdx, objEndIdx + 2);

  const fieldRegex = new RegExp(`(${field}:\\s*)(["']?)[^"',\n]+(["']?)(,?)`);
  const match = objBlock.match(fieldRegex);
  if (!match) return false;

  const fullMatch = match[0];
  const prefix = match[1];
  const trailing = match[4] || "";

  const needsQuotes = field !== "established" && isNaN(Number(value));
  const newValue = needsQuotes
    ? `${prefix}"${value.replace(/"/g, '\\"')}"${trailing}`
    : `${prefix}${value}${trailing}`;

  const absStart = content.indexOf(fullMatch, objStartIdx);
  if (absStart === -1) return false;

  content = content.slice(0, absStart) + newValue + content.slice(absStart + fullMatch.length);
  fs.writeFileSync(filePath, content, "utf-8");
  return true;
}

function patchStaticFileBatch(
  fixes: { category: string; id: string; field: string; suggestedFix: string }[]
): number {
  const byFile: Record<string, typeof fixes> = {};
  for (const f of fixes) {
    const file = f.category === "college" ? "colleges.ts" : "notices.ts";
    (byFile[file] ??= []).push(f);
  }

  let patched = 0;
  for (const [filename, fileFixes] of Object.entries(byFile)) {
    const filePath = path.join(process.cwd(), "src", "data", filename);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    for (const fix of fileFixes) {
      const { id, field, suggestedFix: value } = fix;
      const objStartIdx = content.indexOf(`id: "${id}"`);
      if (objStartIdx === -1) continue;

      const objEndIdx = content.indexOf("};", objStartIdx);
      if (objEndIdx === -1) continue;

      const objBlock = content.slice(objStartIdx, objEndIdx + 2);
      const fieldRegex = new RegExp(`(${field}:\\s*)(["']?)[^"',\n]+(["']?)(,?)`);
      const match = objBlock.match(fieldRegex);
      if (!match) continue;

      const fullMatch = match[0];
      const prefix = match[1];
      const trailing = match[4] || "";
      const needsQuotes = field !== "established" && isNaN(Number(value));
      const newValue = needsQuotes
        ? `${prefix}"${value.replace(/"/g, '\\"')}"${trailing}`
        : `${prefix}${value}${trailing}`;

      const absStart = content.indexOf(fullMatch, objStartIdx);
      if (absStart === -1) continue;

      content = content.slice(0, absStart) + newValue + content.slice(absStart + fullMatch.length);
      modified = true;
      patched++;
    }

    if (modified) fs.writeFileSync(filePath, content, "utf-8");
  }

  return patched;
}

async function applySingleFix(admin: { email: string }, fix: { id: string; field: string; suggestedFix: string; category: string; item?: string }) {
  const { id, field, suggestedFix: value, category, item } = fix;

  if (category === "college") {
    const existing = await prisma.college.findUnique({ where: { id } });
    if (!existing) return { error: "College not found" };

    const updateData: any = {};
    if (field === "established") updateData.established = parseInt(value) || value;
    else if (["ownership", "type", "location", "district", "website", "name", "shortName"].includes(field)) updateData[field] = value;
    else return { error: `Unsupported college field: ${field}` };

    await prisma.college.update({ where: { id }, data: updateData });
  } else if (category === "notice") {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) return { error: "Notice not found" };

    const updateData: any = {};
    if (["title", "type", "status", "publishedDate", "lastDate", "summary"].includes(field)) updateData[field] = value;
    else return { error: `Unsupported notice field: ${field}` };

    await prisma.notice.update({ where: { id }, data: updateData });
  } else {
    return { error: `Unsupported category: ${category}` };
  }

  patchStaticFile(category, id, field, value);

  await prisma.adminLog.create({
    data: {
      action: "apply_fix",
      details: `Applied fix for ${category} ${id} (${item || id}): ${field} → ${value}`,
      adminEmail: admin.email,
    },
  });

  return { success: true };
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      // Batch: apply DB fixes sequentially, then patch static files in one pass per file
      const errors: { issue: string; error: string }[] = [];
      let applied = 0;

      for (const fix of body) {
        try {
          const result = await applySingleFix(admin, fix);
          if (result.success) applied++;
          else errors.push({ issue: fix.item || fix.id, error: result.error || "Unknown" });
        } catch (e: any) {
          errors.push({ issue: fix.item || fix.id, error: e.message || "Unknown" });
        }
      }

      // Rewrite static files in batch (one read/write per file) to avoid race conditions
      const filePatches = body.filter((f: any) => !errors.some((e) => e.issue === (f.item || f.id)));
      if (filePatches.length > 0) patchStaticFileBatch(filePatches);

      return NextResponse.json({ success: applied > 0, applied, errors });
    }

    const result = await applySingleFix(admin, body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Fix error:", err);
    return NextResponse.json({ error: err.message || "Failed to apply fix" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
