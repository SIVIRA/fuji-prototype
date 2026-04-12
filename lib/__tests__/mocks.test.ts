import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMockList, type MockMeta } from "../mocks";
import fs from "fs";
import path from "path";

vi.mock("fs", () => ({
  default: {
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

describe("getMockList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mocks that have meta.json", () => {
    const appDir = path.join(process.cwd(), "app");

    vi.mocked(fs.readdirSync).mockReturnValue([
      "chat-bot" as any,
      "dashboard" as any,
      "api" as any,
      "page.tsx" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation((p) => {
      const name = path.basename(p as string);
      return {
        isDirectory: () => ["chat-bot", "dashboard", "api"].includes(name),
      } as any;
    });

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const str = p as string;
      return str.includes("chat-bot/meta.json") || str.includes("dashboard/meta.json");
    });

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const str = p as string;
      if (str.includes("chat-bot")) {
        return JSON.stringify({ name: "Chat Bot", description: "A chat bot" });
      }
      if (str.includes("dashboard")) {
        return JSON.stringify({ name: "Dashboard", description: "A dashboard" });
      }
      return "";
    });

    const mocks = getMockList();

    expect(mocks).toHaveLength(2);
    expect(mocks[0].slug).toBe("chat-bot");
    expect(mocks[0].name).toBe("Chat Bot");
    expect(mocks[1].slug).toBe("dashboard");
    expect(mocks[1].name).toBe("Dashboard");
  });

  it("should return empty array when no mocks exist", () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      "api" as any,
      "page.tsx" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation(() => ({
      isDirectory: () => true,
    } as any));

    vi.mocked(fs.existsSync).mockReturnValue(false);

    const mocks = getMockList();

    expect(mocks).toHaveLength(0);
  });

  it("should sort mocks alphabetically by name", () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      "zebra" as any,
      "alpha" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation(() => ({
      isDirectory: () => true,
    } as any));

    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const str = p as string;
      if (str.includes("zebra")) {
        return JSON.stringify({ name: "Zebra", description: "Z" });
      }
      return JSON.stringify({ name: "Alpha", description: "A" });
    });

    const mocks = getMockList();

    expect(mocks[0].name).toBe("Alpha");
    expect(mocks[1].name).toBe("Zebra");
  });
});
