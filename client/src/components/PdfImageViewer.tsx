import { Maximize2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { assetUrl } from "../api";
import type { Highlight } from "../types";
import HighlightOverlay from "./HighlightOverlay";

interface Props {
  imageUrl: string;
  highlights: Highlight[];
  editable?: boolean;
  activeTool?: Highlight["type"];
  activeColor?: Highlight["color"];
  onAddHighlight?: (highlight: Highlight) => void;
}

export default function PdfImageViewer({ imageUrl, highlights, editable, activeTool = "box", activeColor = "red", onAddHighlight }: Props) {
  const [zoom, setZoom] = useState(1);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!editable || !onAddHighlight) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onAddHighlight({
      id: `manual-${Date.now()}`,
      type: activeTool,
      color: activeColor,
      x: Math.max(3, Math.min(88, x)),
      y: Math.max(3, Math.min(88, y)),
      width: activeTool === "underline" ? 28 : activeTool === "note" ? 22 : 20,
      height: activeTool === "underline" ? 2 : activeTool === "note" ? 6 : 10,
      label: activeTool === "box" ? "관리자 추가" : activeTool === "underline" ? "밑줄" : activeTool === "check" ? "체크" : "메모"
    });
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-100">
      <div className="no-print flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
        <div className="text-xs font-semibold text-gray-500">{editable ? "이미지를 클릭해 하이라이트 추가" : "PDF 캡처 이미지"}</div>
        <div className="flex items-center gap-1">
          <button className="rounded p-1.5 text-gray-500 hover:bg-gray-100" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} title="축소">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-bold text-gray-600">{Math.round(zoom * 100)}%</span>
          <button className="rounded p-1.5 text-gray-500 hover:bg-gray-100" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} title="확대">
            <Plus className="h-4 w-4" />
          </button>
          <Maximize2 className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="max-h-[680px] overflow-auto bg-gray-100 p-4">
        <div
          className={`relative mx-auto origin-top overflow-visible bg-white shadow-sm ${editable ? "cursor-crosshair" : ""}`}
          onClick={handleClick}
          style={{ width: `${Math.round(100 * zoom)}%`, maxWidth: "900px" }}
        >
          <img src={assetUrl(imageUrl)} className="block w-full select-none" draggable={false} />
          <HighlightOverlay highlights={highlights} />
        </div>
      </div>
    </div>
  );
}
