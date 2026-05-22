import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

export default function UploadBox({ multiple, onFiles }: { multiple?: boolean; onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function select(next: FileList | null) {
    const selected = Array.from(next ?? []);
    setFiles(selected);
    onFiles(selected);
  }

  return (
    <div
      className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center transition hover:border-brand hover:bg-blue-50/40"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        select(event.dataTransfer.files);
      }}
    >
      <input ref={inputRef} type="file" accept="application/pdf" multiple={multiple} className="hidden" onChange={(event) => select(event.target.files)} />
      <UploadCloud className="mx-auto h-10 w-10 text-brand" />
      <h3 className="mt-4 text-lg font-black text-ink">PDF 파일 업로드</h3>
      <p className="mt-2 text-sm text-muted">드래그 앤 드롭하거나 버튼으로 선택하세요.</p>
      <button className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700" onClick={() => inputRef.current?.click()}>
        파일 선택
      </button>
      {files.length > 0 && (
        <div className="mt-5 space-y-2 text-left">
          {files.map((file) => (
            <div key={file.name} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
              {file.name} <span className="text-xs text-muted">업로드 대기 · 100%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
