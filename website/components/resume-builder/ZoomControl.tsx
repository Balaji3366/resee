import { ZoomIn, ZoomOut } from "lucide-react";

export default function ZoomControl({
  zoom,
  onChange,
}: {
  zoom: number;
  onChange: (zoom: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(50, zoom - 10))}
        className="text-slate hover:text-amber"
        aria-label="Zoom out"
      >
        <ZoomOut size={18} />
      </button>
      <input
        type="range"
        min={50}
        max={150}
        step={10}
        value={zoom}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-amber"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(150, zoom + 10))}
        className="text-slate hover:text-amber"
        aria-label="Zoom in"
      >
        <ZoomIn size={18} />
      </button>
      <span className="w-10 text-xs font-semibold text-slate">{zoom}%</span>
    </div>
  );
}
