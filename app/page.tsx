import { getMockList } from "@/lib/mocks";
import Link from "next/link";

export default function Home() {
  const mocks = getMockList();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Fuji Prototype
      </h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        AI Service Mocks &amp; Prototypes
      </p>

      {mocks.length === 0 ? (
        <p style={{ color: "#999" }}>
          No mocks yet. Create a new directory under app/ with a meta.json file.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {mocks.map((mock) => (
            <Link
              key={mock.slug}
              href={`/${mock.slug}`}
              style={{
                display: "block",
                padding: 20,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                {mock.name}
              </h2>
              <p style={{ fontSize: 14, color: "#666" }}>{mock.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
