import type { Grade } from "../types";

const styles: Record<Grade, string> = {
  S: "bg-[#DC2626] text-white",
  A: "bg-[#F97316] text-white",
  B: "bg-[#7C3AED] text-white",
  C: "bg-[#2563EB] text-white",
  D: "bg-[#059669] text-white",
  E: "bg-[#6B7280] text-white"
};

export default function ScoreBadge({ grade, score }: { grade: Grade; score?: number }) {
  return (
    <span className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-extrabold shadow-sm ${styles[grade]}`}>
      {grade}등급{score ? ` · ${score}점` : ""}
    </span>
  );
}
