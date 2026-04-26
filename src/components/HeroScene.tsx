import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, OrbitControls, Environment } from "@react-three/drei";
import { Activity, Headset, ShieldCheck } from "lucide-react";
import * as THREE from "three";

/**
 * 3D CT Scanner hero scene — procedural (no GLB).
 * Auto-rotates gently, floats on Y, and anchors the three marketing tags
 * to 3D positions via drei's <Html>.
 */

function CTScannerModel() {
  const groupRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const scanLightRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (scannerRef.current) {
      // slow auto-rotate on Y (scanner only — tags stay put)
      scannerRef.current.rotation.y += delta * 0.35;
    }
    if (innerRingRef.current) {
      // counter-rotate the inner glowing ring
      innerRingRef.current.rotation.z += delta * 0.6;
    }
    if (scanLightRef.current) {
      // pulse the scan light ring
      const t = state.clock.elapsedTime;
      const mat = scanLightRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.9;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      {/* Scanner meshes sit in a scaled, spinning sub-group so the
          tags (siblings) remain fixed while the device rotates. */}
      <group ref={scannerRef} scale={0.62}>
      {/* ── Outer gantry housing ───────────────────────── */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.6, 0.55, 32, 96]} />
        <meshStandardMaterial
          color="#0f1620"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* ── Inner bore (hollow cylinder) ───────────────── */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.8, 64, 1, true]} />
        <meshStandardMaterial
          color="#0a0e14"
          metalness={0.3}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Glowing mint accent ring (counter-rotating) ── */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.15, 0.025, 16, 128]} />
        <meshStandardMaterial
          color="#43B649"
          emissive="#43B649"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* ── Pulsing scan light (cyan) ──────────────────── */}
      <mesh ref={scanLightRef} position={[0, 0, 0.36]}>
        <torusGeometry args={[1.08, 0.015, 12, 128]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* ── Patient table ──────────────────────────────── */}
      <mesh position={[0, -0.15, 2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.12, 2.8]} />
        <meshStandardMaterial
          color="#e8edf3"
          metalness={0.1}
          roughness={0.45}
        />
      </mesh>

      {/* table pillar */}
      <mesh position={[0, -0.9, 2.4]} castShadow>
        <boxGeometry args={[0.7, 1.3, 0.6]} />
        <meshStandardMaterial
          color="#1a2230"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* base plate */}
      <mesh position={[0, -1.55, 2.2]} receiveShadow>
        <boxGeometry args={[1.8, 0.1, 1.2]} />
        <meshStandardMaterial color="#0f1620" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ── Side detail studs around the gantry ────────── */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0]}
          >
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#43B649"
              emissive="#43B649"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      </group>

      {/* ── Floating labels bracketing the device ─────── */}
      {/* Positioned to frame the scanner width (~±1.35 world units at
          scale 0.62). Fixed DOM size (no distanceFactor) for legibility. */}
      <Html position={[-1.55, 1.55, 0]} center style={{ pointerEvents: "none" }}>
        <Tag
          icon={<Activity size={14} strokeWidth={2.4} />}
          label="Diagnostic Imaging"
        />
      </Html>
      <Html position={[1.55, 1.55, 0]} center style={{ pointerEvents: "none" }}>
        <Tag
          icon={<ShieldCheck size={14} strokeWidth={2.4} />}
          label="ISO Approved"
        />
      </Html>
      <Html position={[0, -1.95, 0]} center style={{ pointerEvents: "none" }}>
        <Tag
          icon={<Headset size={14} strokeWidth={2.4} />}
          label="24/7 Technical"
        />
      </Html>
    </group>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="pointer-events-auto flex w-52 items-center gap-2.5 rounded-full border border-mint-soft/40 bg-navy-900/95 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-6px_rgba(0,0,0,0.8)] ring-1 ring-white/5 backdrop-blur-md"
      style={{ color: "#FFFFFF" }}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-navy-900">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}

export default function HeroScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.5, 6.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* lights */}
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[5, 6, 5]}
            intensity={1.2}
            color="#ffffff"
          />
          <pointLight
            position={[-4, 2, 3]}
            intensity={1.8}
            color="#43B649"
            distance={12}
          />
          <pointLight
            position={[4, -2, 3]}
            intensity={1.4}
            color="#00FFFF"
            distance={10}
          />

          {/* subtle environment so metals have something to reflect */}
          <Environment preset="city" />

          {/* floating + auto-rotating model */}
          <Float
            speed={1.3}
            rotationIntensity={0.25}
            floatIntensity={0.6}
            floatingRange={[-0.08, 0.08]}
          >
            <CTScannerModel />
          </Float>

          {/* user can gently orbit; zoom/pan off. Scanner spins itself. */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
