import fs from "fs";
import path from "path";

export interface MockMeta {
  slug: string;
  name: string;
  description: string;
}

export function getMockList(): MockMeta[] {
  const appDir = path.join(process.cwd(), "app");
  const entries = fs.readdirSync(appDir);

  const mocks: MockMeta[] = [];

  for (const entry of entries) {
    const entryPath = path.join(appDir, entry);
    const stat = fs.statSync(entryPath);

    if (!stat.isDirectory()) continue;

    const metaPath = path.join(entryPath, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    try {
      const raw = fs.readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw);

      mocks.push({
        slug: entry,
        name: meta.name,
        description: meta.description,
      });
    } catch {
      // Skip mocks with invalid meta.json
    }
  }

  mocks.sort((a, b) => a.name.localeCompare(b.name));

  return mocks;
}
