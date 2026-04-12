import "./styles.css";

export default function PunkRecordsPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#0F1117] text-gray-100">{children}</div>;
}
