import React, { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from '@react-three/drei/core';
import { Battery, BriefcaseBusiness, DoorOpen, Gauge, Monitor, Plug, Rotate3d } from 'lucide-react';
import { Box3, MathUtils, MeshPhysicalMaterial, Shape, ShapeGeometry, ExtrudeGeometry, Vector3 } from 'three';

const bodyShape = new Shape();
bodyShape.moveTo(-2.04, 0.37);
bodyShape.lineTo(-2.03, 0.62);
bodyShape.quadraticCurveTo(-1.99, 0.85, -1.69, 0.9);
bodyShape.lineTo(-1.27, 1.12);
bodyShape.quadraticCurveTo(-0.88, 1.55, -0.52, 1.57);
bodyShape.lineTo(0.28, 1.57);
bodyShape.quadraticCurveTo(0.59, 1.55, 0.78, 1.31);
bodyShape.lineTo(1.25, 0.92);
bodyShape.quadraticCurveTo(1.72, 0.86, 1.94, 0.7);
bodyShape.quadraticCurveTo(2.06, 0.6, 2.05, 0.37);
bodyShape.closePath();

[-1.28, 1.28].forEach((x) => {
  const wheelArch = new Shape();
  wheelArch.absarc(x, 0.43, 0.47, 0, Math.PI * 2, true);
  bodyShape.holes.push(wheelArch);
});

const bodyGeometry = new ExtrudeGeometry(bodyShape, {
  depth: 1.52,
  bevelEnabled: true,
  bevelSegments: 5,
  steps: 1,
  bevelSize: 0.035,
  bevelThickness: 0.045,
  curveSegments: 20,
});
bodyGeometry.translate(0, 0, -0.76);

const windowShape = new Shape();
windowShape.moveTo(-1.2, 1.0);
windowShape.lineTo(-0.72, 1.43);
windowShape.quadraticCurveTo(-0.62, 1.5, -0.46, 1.5);
windowShape.lineTo(0.24, 1.5);
windowShape.lineTo(0.69, 1.13);
windowShape.lineTo(0.82, 0.99);
windowShape.closePath();
const windowGeometry = new ShapeGeometry(windowShape, 18);

const paintOptions = [
  { label: 'Teal', color: '#0F766E' },
  { label: 'Blue', color: '#1D4ED8' },
  { label: 'White', color: '#DCE5EE' },
  { label: 'Red', color: '#B93838' },
];

const cameraPositions = {
  Front: [6.3, 2.05, 0],
  Side: [0, 2.2, 6.3],
  Rear: [-6.3, 2.05, 0],
  Top: [0, 7.5, 0.01],
};

function Wheel({ x, side }) {
  return (
    <group position={[x, 0.44, side * 0.76]} rotation={[side * Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.24, 40]} />
        <meshStandardMaterial color="#20262D" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.035, 32]} />
        <meshStandardMaterial color="#AEB9C2" metalness={0.75} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.255, 0.026, 8, 36]} />
        <meshStandardMaterial color="#E4E9ED" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4].map((spoke) => (
        <mesh key={spoke} position={[0, 0.128, 0]} rotation={[0, (spoke * Math.PI * 2) / 5, 0]}>
          <boxGeometry args={[0.042, 0.024, 0.22]} />
          <meshStandardMaterial color="#E4E9ED" metalness={0.72} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.074, 0.074, 0.055, 24]} />
        <meshStandardMaterial color="#C9D2D9" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function DoorPanel({ hingeX, side, length, color, open, reducedMotion }) {
  const door = useRef(null);

  useFrame((_, delta) => {
    if (!door.current) return;
    const target = open ? side * 0.82 : 0;
    door.current.rotation.y = reducedMotion
      ? target
      : MathUtils.damp(door.current.rotation.y, target, 4.5, delta);
  });

  return (
    <group ref={door} position={[hingeX, 0.73, side * 0.77]}>
      <mesh position={[-length / 2, 0, side * 0.018]}>
        <boxGeometry args={[length + 0.035, 0.44, 0.025]} />
        <meshStandardMaterial color="#17212A" roughness={0.55} />
      </mesh>
      <mesh position={[-length / 2, 0, side * 0.038]} castShadow>
        <boxGeometry args={[length - 0.035, 0.4, 0.025]} />
        <meshPhysicalMaterial color={color} metalness={0.42} roughness={0.25} clearcoat={0.85} clearcoatRoughness={0.18} />
      </mesh>
      <mesh position={[-length * 0.34, 0.09, side * 0.058]}>
        <boxGeometry args={[0.14, 0.025, 0.018]} />
        <meshStandardMaterial color="#D8E0E6" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

function FallbackCar({ color, doorsOpen, reducedMotion }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} metalness={0.42} roughness={0.25} clearcoat={0.9} clearcoatRoughness={0.18} />
      </mesh>

      {[1, -1].map((side) => (
        <React.Fragment key={side}>
          <mesh geometry={windowGeometry} position={[0, 0, side * 0.815]} rotation={side < 0 ? [0, Math.PI, 0] : undefined}>
            <meshPhysicalMaterial color="#18252E" metalness={0.25} roughness={0.16} clearcoat={0.9} side={2} />
          </mesh>
          <mesh position={[0.48, 1.28, side * 0.83]} rotation={[0, 0, -0.72]}>
            <boxGeometry args={[0.055, 0.62, 0.025]} />
            <meshPhysicalMaterial color={color} clearcoat={0.8} />
          </mesh>
          <mesh position={[-0.39, 1.29, side * 0.83]}>
            <boxGeometry args={[0.055, 0.43, 0.025]} />
            <meshPhysicalMaterial color={color} clearcoat={0.8} />
          </mesh>
          <mesh position={[-0.94, 1.22, side * 0.83]} rotation={[0, 0, 0.64]}>
            <boxGeometry args={[0.055, 0.56, 0.025]} />
            <meshPhysicalMaterial color={color} clearcoat={0.8} />
          </mesh>
          <DoorPanel hingeX={1.3} side={side} length={1.08} color={color} open={doorsOpen} reducedMotion={reducedMotion} />
          <DoorPanel hingeX={0.2} side={side} length={0.88} color={color} open={doorsOpen} reducedMotion={reducedMotion} />
          <mesh position={[0.76, 1.02, side * 0.91]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.18]} />
            <meshPhysicalMaterial color={color} metalness={0.35} roughness={0.24} clearcoat={0.9} />
          </mesh>
          <mesh position={[0.78, 1.025, side * 1.01]}>
            <boxGeometry args={[0.105, 0.055, 0.015]} />
            <meshStandardMaterial color="#1B252D" roughness={0.12} metalness={0.2} />
          </mesh>
          <mesh position={[-1.57, 0.87, side * 0.785]}>
            <cylinderGeometry args={[0.1, 0.1, 0.025, 32]} />
            <meshPhysicalMaterial color={color} metalness={0.35} roughness={0.3} clearcoat={0.8} />
          </mesh>
          <Wheel x={1.28} side={side} />
          <Wheel x={-1.28} side={side} />
        </React.Fragment>
      ))}

      <mesh position={[2.02, 0.72, 0]}>
        <boxGeometry args={[0.055, 0.075, 1.08]} />
        <meshStandardMaterial color="#F5F9FC" emissive="#E4F4FF" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-2.015, 0.72, 0]}>
        <boxGeometry args={[0.055, 0.075, 1.12]} />
        <meshStandardMaterial color="#B93838" emissive="#751C1C" emissiveIntensity={0.24} />
      </mesh>
      <mesh position={[2.02, 0.5, 0]}>
        <boxGeometry args={[0.035, 0.11, 0.58]} />
        <meshStandardMaterial color="#26333D" roughness={0.48} />
      </mesh>
      <mesh position={[-1.99, 0.31, 0]}>
        <boxGeometry args={[0.2, 0.13, 1.14]} />
        <meshStandardMaterial color="#20272D" roughness={0.65} />
      </mesh>
      {[-0.38, 0, 0.38].map((z) => (
        <mesh key={z} position={[-1.91, 0.26, z]}>
          <boxGeometry args={[0.12, 0.12, 0.045]} />
          <meshStandardMaterial color="#11171D" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function GLBCar({ color }) {
  const { scene } = useGLTF('/models/car.glb');
  const vehicle = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!object.isMesh) return;
      const recolor = (material) => {
        const copy = material.clone();
        if (/paint|body/i.test(`${object.name} ${material.name}`)) {
          copy.color.set(color);
          if ('clearcoat' in copy) copy.clearcoat = 0.9;
          copy.needsUpdate = true;
        }
        return copy;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(recolor)
        : recolor(object.material);
      object.castShadow = true;
      object.receiveShadow = true;
    });

    const bounds = new Box3().setFromObject(clone);
    const dimensions = bounds.getSize(new Vector3());
    clone.scale.setScalar(4.1 / Math.max(dimensions.x, dimensions.z));
    clone.updateMatrixWorld(true);
    const scaledBounds = new Box3().setFromObject(clone);
    const center = scaledBounds.getCenter(new Vector3());
    clone.position.set(-center.x, -scaledBounds.min.y, -center.z);
    return clone;
  }, [scene, color]);

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <primitive object={vehicle} />
    </group>
  );
}

function CameraTarget({ cameraPosition, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0.76, 0);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.76, 0);
      controlsRef.current.update();
    }
  }, [camera, cameraPosition, controlsRef]);

  return null;
}

function WebGLFallback({ image }) {
  return image ? (
    <img src={image} alt="Electric vehicle" className="h-full w-full object-contain" />
  ) : (
    <div className="flex h-full items-center justify-center bg-aurora-raised text-sm text-aurora-muted">3D view unavailable</div>
  );
}

class SceneErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <WebGLFallback image={this.props.image} />;
    return this.props.children;
  }
}

function SceneCanvas({ color, doorsOpen, reducedMotion, autoRotate, interactive, cameraView, fallbackImage, modelAvailable }) {
  const controlsRef = useRef(null);
  const cameraPosition = interactive ? cameraPositions[cameraView] : [4.7, 2.55, 5.6];

  return (
    <SceneErrorBoundary image={fallbackImage}>
      <Canvas
        camera={{ position: cameraPosition, fov: 36 }}
        dpr={[1, 1.5]}
        fallback={<WebGLFallback image={fallbackImage} />}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 7, 5]} intensity={2.1} castShadow />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.3} color="#FFFFFF" position={[0, 5, 1]} scale={[7, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#D8E5EF" position={[-4, 2, -2]} rotation={[0, Math.PI / 3, 0]} scale={[5, 3, 1]} />
          <Lightformer form="ring" intensity={1.1} color="#FFFFFF" position={[4, 2, 3]} scale={3} />
        </Environment>
        <Suspense fallback={<FallbackCar color={color} doorsOpen={doorsOpen} reducedMotion={reducedMotion} />}>
          {modelAvailable
            ? <GLBCar color={color} />
            : <FallbackCar color={color} doorsOpen={doorsOpen} reducedMotion={reducedMotion} />}
          <ContactShadows position={[0, 0.015, 0]} opacity={0.3} scale={6.5} blur={2.4} far={4} />
        </Suspense>
        <CameraTarget cameraPosition={cameraPosition} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.76, 0]}
          enablePan={false}
          enableZoom={interactive}
          autoRotate={interactive ? autoRotate && !reducedMotion : !reducedMotion}
          autoRotateSpeed={0.55}
          minDistance={4.1}
          maxDistance={9}
          minPolarAngle={0.18}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}

function formatValue(value, suffix = '') {
  return value === null || value === undefined || value === '' ? null : `${value}${suffix}`;
}

const showroomPins = [
  { id: 'charging', label: 'Charging port', Icon: Plug, position: { top: '54%', left: '18%' } },
  { id: 'battery', label: 'Battery', Icon: Battery, position: { top: '77%', left: '49%' } },
  { id: 'motor', label: 'Motor', Icon: Gauge, position: { top: '55%', left: '78%' } },
  { id: 'boot', label: 'Boot', Icon: BriefcaseBusiness, position: { top: '34%', left: '12%' } },
  { id: 'cabin', label: 'Cabin tech', Icon: Monitor, position: { top: '25%', left: '51%' } },
];

function getPinDetails(ev, id) {
  if (id === 'charging') {
    return [
      formatValue(ev.charging?.portType, ' connector'),
      formatValue(ev.charging?.maxDcRateKw, ' kW max DC'),
      formatValue(ev.charging?.acChargingTimeHours, ' h AC charge'),
    ].filter(Boolean);
  }
  if (id === 'battery') {
    return [
      formatValue(ev.battery?.capacityKwh, ' kWh'),
      ev.battery?.chemistry,
      formatValue(ev.range?.realWorldEstimateCity, ' km city range'),
    ].filter(Boolean);
  }
  if (id === 'motor') {
    return [
      formatValue(ev.performance?.powerBhp, ' bhp'),
      formatValue(ev.performance?.torqueNm, ' Nm torque'),
      formatValue(ev.performance?.acceleration0to100, ' s 0-100 km/h'),
    ].filter(Boolean);
  }
  if (id === 'boot') {
    return [
      formatValue(ev.dimensions?.bootSpaceLitres, ' L boot space'),
      formatValue(ev.dimensions?.seatingCapacity, ' seats'),
    ].filter(Boolean);
  }
  return ev.features?.slice(0, 3) || [];
}

export default function EVScene({ fallbackImage, ev = null }) {
  const interactive = Boolean(ev);
  const fallback = fallbackImage || ev?.imageUrl || ev?.images?.[0]?.url;
  const [color, setColor] = useState(paintOptions[0].color);
  const [cameraView, setCameraView] = useState('Side');
  const [autoRotate, setAutoRotate] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [modelAvailable, setModelAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    media.addEventListener?.('change', updatePreference);
    return () => media.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/models/car.glb', { method: 'HEAD' })
      .then((response) => {
        const contentType = response.headers.get('content-type') || '';
        if (active && response.ok && !contentType.includes('text/html')) setModelAvailable(true);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!interactive) {
    return (
      <SceneCanvas
        color={color}
        doorsOpen={false}
        reducedMotion={reducedMotion}
        autoRotate={false}
        interactive={false}
        cameraView="Side"
        fallbackImage={fallback}
        modelAvailable={modelAvailable}
      />
    );
  }

  const activePin = showroomPins.find((pin) => pin.id === selectedPin);
  const pinDetails = activePin ? getPinDetails(ev, activePin.id) : [];

  return (
    <div className="space-y-4" aria-label={`${ev.name} 3D showroom`}>
      <div className="relative h-[320px] min-w-0 w-full overflow-hidden rounded-lg border border-aurora-border bg-white sm:h-[400px] lg:h-[480px]">
        <SceneCanvas
          color={color}
          doorsOpen={doorsOpen}
          reducedMotion={reducedMotion}
          autoRotate={autoRotate}
          interactive
          cameraView={cameraView}
          fallbackImage={fallback}
          modelAvailable={modelAvailable}
        />
        <div className="pointer-events-none absolute inset-0">
          {showroomPins.map(({ id, label, Icon, position }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={selectedPin === id}
              title={label}
              onClick={() => setSelectedPin(id)}
              className={`pointer-events-auto absolute flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${selectedPin === id ? 'border-aurora-violet bg-aurora-violet text-white' : 'border-white bg-white text-aurora-text hover:border-aurora-violet'}`}
              style={position}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Camera view">
          {Object.keys(cameraPositions).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={cameraView === view}
              onClick={() => setCameraView(view)}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${cameraView === view ? 'border-aurora-violet bg-aurora-violet text-white' : 'border-aurora-border bg-white text-aurora-text hover:bg-aurora-raised'}`}
            >
              {view}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-aurora-text">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(event) => setAutoRotate(event.target.checked)}
              disabled={reducedMotion}
              className="h-4 w-4 accent-aurora-violet"
            />
            Auto-rotate
          </label>
          <button
            type="button"
            onClick={() => setDoorsOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-md bg-aurora-violet px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            <DoorOpen aria-hidden="true" className="h-4 w-4" />
            {doorsOpen ? 'Close doors' : 'Open doors'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Paint colour">
        <span className="mr-1 text-sm font-semibold text-aurora-text">Paint</span>
        {paintOptions.map((paint) => (
          <button
            key={paint.label}
            type="button"
            aria-label={`${paint.label} paint`}
            aria-pressed={color === paint.color}
            title={`${paint.label} paint`}
            onClick={() => setColor(paint.color)}
            className={`h-8 w-8 rounded-full border-2 ${color === paint.color ? 'border-aurora-text' : 'border-white shadow-sm'}`}
            style={{ backgroundColor: paint.color }}
          />
        ))}
      </div>

      {activePin && (
        <div aria-live="polite" className="rounded-md border border-aurora-border bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Rotate3d aria-hidden="true" className="h-4 w-4 text-aurora-violet" />
            <h3 className="font-display text-sm font-semibold text-aurora-text">{activePin.label}</h3>
          </div>
          <p className="mt-1 text-sm text-aurora-muted">
            {pinDetails.length ? pinDetails.join(' · ') : 'No specification data listed for this vehicle.'}
          </p>
        </div>
      )}
    </div>
  );
}