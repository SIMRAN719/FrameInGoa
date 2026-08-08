import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { QrMatrix } from '../lib/qr';
import { createGoaQrCanvas, downloadCanvas } from '../lib/qrCanvas';
import { SUN_DIRECTION } from '../lib/sunDirection';
import CityBlocks from './CityBlocks';
import GradientSky from './GradientSky';
import './GoaQrScene.css';

interface GoaQrSceneProps {
  matrix: QrMatrix;
  teamName: string;
  shareUrl: string;
}

const SKY_HORIZON = '#f5b06e';

const GoaQrScene = ({ matrix, teamName, shareUrl }: GoaQrSceneProps) => {
  // decorate=false: decoration dots sit at each cell's sample point and would
  // corrupt real QR modules. The 3D scene carries the tree/scooter flavor instead.
  const flatCanvas = useMemo(() => createGoaQrCanvas(matrix, false), [matrix]);
  const flatDataUrl = useMemo(() => flatCanvas.toDataURL('image/png'), [flatCanvas]);
  const [copied, setCopied] = useState(false);

  const safeName = (teamName || 'builder').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sunPos: [number, number, number] = [
    SUN_DIRECTION.x * matrix.totalSize * 1.3,
    SUN_DIRECTION.y * matrix.totalSize * 1.3,
    SUN_DIRECTION.z * matrix.totalSize * 1.3,
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy your Goa QR link:', shareUrl);
    }
  };

  return (
    <div className="goa-qr-scene">
      <h3 className="goa-qr-scene__title">Your Goa street, from above 🛵</h3>
      <div className="goa-qr-scene__canvas-wrap">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          camera={{ position: [0, matrix.totalSize * 1.1, matrix.totalSize * 1.3], fov: 44 }}
        >
          <GradientSky radius={matrix.totalSize * 20} />
          <fog attach="fog" args={[SKY_HORIZON, matrix.totalSize * 1.6, matrix.totalSize * 4.2]} />
          <ambientLight intensity={0.75} color="#ffcf9e" />
          <hemisphereLight args={['#ffa563', '#8a5a2e', 0.5]} />
          <directionalLight
            position={sunPos}
            intensity={2.6}
            color="#ff9d52"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-matrix.totalSize}
            shadow-camera-right={matrix.totalSize}
            shadow-camera-top={matrix.totalSize}
            shadow-camera-bottom={-matrix.totalSize}
            shadow-camera-far={matrix.totalSize * 3}
            shadow-bias={-0.0015}
          />
          <Suspense fallback={null}>
            <CityBlocks matrix={matrix} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={matrix.totalSize * 0.55}
            maxDistance={matrix.totalSize * 2.6}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2.15}
            autoRotate
            autoRotateSpeed={0.5}
            enableDamping
          />
        </Canvas>
        <p className="goa-qr-scene__hint">Drag to tilt & spin the street · pinch to zoom out to the beach</p>
      </div>

      <div className="goa-qr-scene__export">
        <img className="goa-qr-scene__flat-preview" src={flatDataUrl} alt="Scannable Goa-themed QR code" />
        <div className="goa-qr-scene__export-actions">
          <div className="goa-qr-scene__btn-row">
            <button
              type="button"
              className="goa-qr-scene__btn"
              onClick={() => downloadCanvas(flatCanvas, `${safeName}-goa-qr.png`)}
            >
              ⬇ Download QR
            </button>
            <button type="button" className="goa-qr-scene__btn goa-qr-scene__btn--ghost" onClick={handleCopyLink}>
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
          <p className="goa-qr-scene__hint">
            Scans straight to your team's visitor page — same street, seen from above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoaQrScene;
