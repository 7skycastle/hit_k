import type { Highlight } from "../types";

const colorMap = {
  red: "border-[#DC2626] text-[#DC2626] bg-red-500/10",
  yellow: "border-yellow-400 text-yellow-700 bg-yellow-300/20",
  blue: "border-[#2563EB] text-[#2563EB] bg-blue-500/10",
  green: "border-[#059669] text-[#059669] bg-emerald-500/10",
  gray: "border-gray-500 text-gray-600 bg-gray-200/70"
};

export default function HighlightOverlay({ highlights }: { highlights: Highlight[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {highlights.map((item) => {
        const style = { left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` };
        if (item.type === "underline") {
          return <div key={item.id} className={`absolute border-b-4 ${colorMap[item.color]}`} style={style} />;
        }
        if (item.type === "check") {
          return (
            <div key={item.id} className="absolute flex items-center gap-1 text-[#059669]" style={style}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xl font-black shadow">✓</span>
              {item.label && <span className="rounded bg-white/90 px-2 py-1 text-xs font-bold shadow">{item.label}</span>}
            </div>
          );
        }
        if (item.type === "note") {
          return (
            <div key={item.id} className={`absolute rounded border px-2 py-1 text-xs font-bold shadow-sm ${colorMap[item.color]}`} style={style}>
              {item.label}
            </div>
          );
        }
        return (
          <div key={item.id} className={`absolute rounded-sm border-4 ${colorMap[item.color]}`} style={style}>
            {item.label && <span className="absolute -top-8 left-0 whitespace-nowrap rounded bg-white px-2 py-1 text-xs font-bold shadow">{item.label}</span>}
          </div>
        );
      })}
    </div>
  );
}
