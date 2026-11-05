import { useEffect, useId, useRef, type CSSProperties, type PointerEvent } from "react";
import { cartridgeShapes, getCartridgeShape } from "@/lib/cartridge-shapes";
import type { EmulationApp } from "@/types/emulation";
import "@/cartridge-shapes.css";

export function CartridgeDisplay({ app }: { app: EmulationApp }) {
  const shape = getCartridgeShape(app.system);
  const geometry = cartridgeShapes[shape];
  const [x, y, width, height] = geometry.label;
  const [contactX, contactY, contactWidth] = geometry.contacts;
  const clipId = useId().replace(/:/g, "");
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      stage.current?.style.setProperty("--tilt-x", `${-vertical * 7}deg`);
      stage.current?.style.setProperty("--tilt-y", `${horizontal * 9}deg`);
    });
  };
  const resetTilt = () => {
    window.cancelAnimationFrame(frame.current);
    stage.current?.style.removeProperty("--tilt-x");
    stage.current?.style.removeProperty("--tilt-y");
  };

  return <div ref={stage} className={`cartridge-dock cartridge-stage shape-${shape}`} onPointerMove={tilt} onPointerLeave={resetTilt}>
    <div className="cartridge cartridge-model">
      <svg viewBox="0 0 320 280" role="img" aria-label={`${app.system} ${shape === "disc" ? "jewel case" : "cartridge"} for ${app.name}`} className="cartridge-sculpture">
        <defs><clipPath id={clipId}><rect x={x + 3} y={y + 22} width={width - 6} height={height - 25} rx="3" /></clipPath></defs>
        <path d={geometry.path} transform="translate(7 5)" fill={geometry.edge} stroke={geometry.edge} strokeWidth="5" strokeLinejoin="round" />
        <path d={geometry.path} fill={geometry.color} stroke={geometry.edge} strokeWidth="3" strokeLinejoin="round" />
        <path d={geometry.path} fill="none" stroke="#ffffff" strokeOpacity=".3" strokeWidth="2" transform="translate(-1 -1)" />
        {geometry.ribs.map(([rx, ry, rw, rh], index) => <g key={index}><rect x={rx} y={ry} width={rw} height={rh} rx="1" fill={geometry.edge} opacity=".6" /><path d={`M${rx} ${ry + rh + 1}h${rw}`} stroke="#ffffff" strokeOpacity=".3" /></g>)}
        <rect x={x} y={y} width={width} height={height} rx="4" fill="color-mix(in srgb, var(--label-color) 25%, #e6e9ec)" stroke={geometry.edge} strokeWidth="3" style={{ "--label-color": app.color } as CSSProperties} />
        <rect x={x + 2} y={y + 2} width={width - 4} height="20" rx="2" fill="#243457" />
        <text x={x + width / 2} y={y + 15} fill="#fff5ce" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="10" textLength={Math.min(width - 16, app.system.length * 6)} lengthAdjust="spacingAndGlyphs">{app.system.toUpperCase()}</text>
        {app.artwork ? <image href={app.artwork} x={x + 4} y={y + 23} width={width - 8} height={height - 27} preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} /> : <text x={x + width / 2} y={y + 22 + (height - 22) / 2} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(48, height - 30)}>{app.icon}</text>}
        {contactWidth > 0 && <g><rect x={contactX - 3} y={contactY - 2} width={contactWidth + 6} height={shape === "hucard" ? 43 : 14} fill={geometry.edge} />{Array.from({ length: 12 }, (_, index) => <rect key={index} x={contactX + index * contactWidth / 12} y={contactY} width={contactWidth / 12 - 3} height={shape === "hucard" ? 36 : 10} fill="#d6b85a" />)}</g>}
        {[x - 8, x + width + 8].map(screwX => <g key={screwX}><circle cx={screwX} cy={y + height - 6} r="3" fill={geometry.edge} /><path d={`M${screwX - 1.5} ${y + height - 7.5}l3 3`} stroke="#b6c1cc" strokeWidth="1" /></g>)}
      </svg>
    </div>
    <div aria-hidden="true" className="console-slot"><span className="console-slot-light" /><span className="console-slot-vents" /></div>
  </div>;
}
