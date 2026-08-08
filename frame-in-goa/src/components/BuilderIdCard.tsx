import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { toPng } from 'html-to-image';
import type { Member } from '../lib/types';
import { generateBuilderTitle } from '../lib/builderTitle';
import './BuilderIdCard.css';

interface BuilderIdCardProps {
  teamName: string;
  members: Member[];
}

const MAX_TILT = 10;

function initials(name: string): string {
  const chars = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return chars || '?';
}

function slugify(name: string): string {
  return (name || 'builder').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const BuilderIdCard = ({ teamName, members }: BuilderIdCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = members[activeIndex] ?? members[0];
  const builderTitle = generateBuilderTitle(active.name, active.stack);
  const canSwap = members.length > 1;

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * MAX_TILT;
    const ry = (px - 0.5) * MAX_TILT;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const resetTilt = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '25%');
  };

  const swapCard = () => {
    if (!canSwap) return;
    setActiveIndex((i) => (i + 1) % members.length);
  };

  const exportCard = async (): Promise<string | null> => {
    if (!frameRef.current) return null;
    return toPng(frameRef.current, { pixelRatio: 2, cacheBust: true });
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const dataUrl = await exportCard();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `${slugify(active.name)}-builder-id.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const dataUrl = await exportCard();
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${slugify(active.name)}-builder-id.png`, { type: 'image/png' });

      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${active.name} — Builder ID`,
          text: `Check out my Frame in Goa builder badge!`,
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // share sheet dismissed — nothing to do
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="builder-id">
      <h3 className="builder-id__title">Your Builder ID 💳</h3>

      <div className="builder-id__stage" onPointerMove={handlePointerMove} onPointerLeave={resetTilt}>
        {canSwap && (
          <>
            <div className="builder-id__ghost builder-id__ghost--2" aria-hidden="true" />
            <div className="builder-id__ghost builder-id__ghost--1" aria-hidden="true" />
          </>
        )}

        <div className="builder-id__frame" ref={frameRef}>
          <div className="builder-id__card" ref={cardRef}>
            <div className="builder-id__glare" />

            <div className="builder-id__content" key={activeIndex}>
              <div className="builder-id__row builder-id__row--top">
                <span className="builder-id__brand">🌴 Frame in Goa</span>
                <span className="builder-id__pass">Builder Pass</span>
              </div>

              <div className="builder-id__row builder-id__row--main">
                <div className="builder-id__id-block">
                  <div className="builder-id__chip" aria-hidden="true" />
                  <div className="builder-id__photo">
                    {active.photo ? <img src={active.photo} alt="" /> : <span>{initials(active.name)}</span>}
                  </div>
                </div>
                <div className="builder-id__text-block">
                  <h2 className="builder-id__name">{active.name}</h2>
                  <p className="builder-id__role">{builderTitle}</p>
                </div>
              </div>

              <div className="builder-id__stack">
                {active.stack.slice(0, 5).map((tech) => (
                  <span key={tech} className="builder-id__chip-tag">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="builder-id__row builder-id__row--bottom">
                <span className="builder-id__team">
                  {teamName} {members.length > 1 && `· ${activeIndex + 1}/${members.length}`}
                </span>
              </div>
            </div>

            {canSwap && (
              <button
                type="button"
                className="builder-id__hole"
                onClick={swapCard}
                aria-label="Show next teammate's card"
                title="Show next teammate's card"
              >
                <span className="builder-id__hole-ring" />
                <span className="builder-id__hole-chain">🔗</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {canSwap && (
        <p className="builder-id__hint">🔗 tap the chain to flip through {members.length} teammates' cards</p>
      )}

      <div className="builder-id__actions">
        <button type="button" className="builder-id__btn" onClick={handleDownload} disabled={busy}>
          ⬇ Download badge
        </button>
        <button type="button" className="builder-id__btn builder-id__btn--secondary" onClick={handleShare} disabled={busy}>
          📤 Share
        </button>
      </div>
    </div>
  );
};

export default BuilderIdCard;
