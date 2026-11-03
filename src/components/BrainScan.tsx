import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * Hero centrepiece: a 3D brain passing through a CT scanner.
 *
 * Above the scan plane the brain is an opaque, marble-like sculpture.
 * Where the plane has passed it turns into an X-ray read: dark body,
 * fresnel rim and evenly spaced axial slice contours. A soft sheet of
 * light marks the plane itself, so from the camera it reads as one
 * smooth line travelling through the model.
 *
 * Scan progress is reported through `onScan` so the HTML readout can
 * stay in sync without React re-rendering every frame.
 */

export const BRAIN_MODEL_URL = "/models/brain.glb";


type Palette = {
  base: THREE.Color;
  shadow: THREE.Color;
  xray: THREE.Color;
  scan: THREE.Color;
};

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    base: new THREE.Color("#e9ebe6"),
    shadow: new THREE.Color("#3a3f3a"),
    xray: new THREE.Color("#0d1410"),
    scan: new THREE.Color("#8fd4a6"),
  },
  light: {
    base: new THREE.Color("#d8dbd4"),
    shadow: new THREE.Color("#5f665e"),
    xray: new THREE.Color("#e9efea"),
    scan: new THREE.Color("#1f7a45"),
  },
};

const vertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform float uScanY;
  uniform float uInvert;
  uniform float uSliceDensity;
  uniform vec3 uBase;
  uniform vec3 uShadow;
  uniform vec3 uXray;
  uniform vec3 uScan;
  uniform sampler2D uNormalMap;
  uniform sampler2D uMap;
  uniform float uHasNormalMap;
  uniform float uHasMap;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;

  // Tangent-free normal mapping from screen-space derivatives.
  vec3 perturb(vec3 pos, vec3 N, vec2 uv, vec3 mapN) {
    vec3 q0 = dFdx(pos);
    vec3 q1 = dFdy(pos);
    vec2 st0 = dFdx(uv);
    vec2 st1 = dFdy(uv);
    vec3 q1perp = cross(q1, N);
    vec3 q0perp = cross(N, q0);
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max(dot(T, T), dot(B, B));
    float scale = det == 0.0 ? 0.0 : inversesqrt(det);
    return normalize(T * (mapN.x * scale) + B * (mapN.y * scale) + N * mapN.z);
  }

  void main() {
    vec3 n = normalize(vNormalW);
    if (!gl_FrontFacing) n = -n;
    if (uHasNormalMap > 0.5) {
      vec3 mapN = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
      mapN.xy *= 1.15;
      n = perturb(vPosW, n, vUv, mapN);
    }
    vec3 v = normalize(cameraPosition - vPosW);
    // Cavity from the albedo: sulci are darker in the source texture.
    float cavity = 1.0;
    if (uHasMap > 0.5) {
      vec3 albedo = texture2D(uMap, vUv).rgb;
      float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
      cavity = mix(0.62, 1.08, smoothstep(0.12, 0.62, lum));
    }

    // ── Sculpture shading (unscanned) ──
    vec3 key = normalize(vec3(-0.45, 0.85, 0.55));
    vec3 fill = normalize(vec3(0.7, -0.2, 0.4));
    float diff = max(dot(n, key), 0.0);
    float fil = max(dot(n, fill), 0.0) * 0.35;
    float wrap = clamp(diff * 0.8 + fil + 0.18, 0.0, 1.0);
    float spec = pow(max(dot(reflect(-key, n), v), 0.0), 28.0) * 0.18;
    vec3 sculpture = mix(uShadow, uBase, smoothstep(0.0, 1.0, wrap * cavity)) + spec;

    // ── X-ray read (scanned) ──
    float fres = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 2.4);
    // Axial slice contours: ~1px anti-aliased lines at even heights.
    float y = vPosW.y * uSliceDensity;
    float g = abs(fract(y - 0.5) - 0.5) / max(fwidth(y), 1e-4);
    float slice = 1.0 - clamp(g - 0.5, 0.0, 1.0);
    // mix (not add) so the read works on light and dark backgrounds
    vec3 xray = mix(uXray, uScan, clamp(fres * 0.85 + slice * 0.6 * (0.35 + fres), 0.0, 1.0));

    // Region split. The line travels downward; on even passes it turns
    // the sculpture into the X-ray, on odd passes it turns it back, so
    // the loop never snaps.
    float d = vPosW.y - uScanY;
    float above = smoothstep(-0.004, 0.004, d);
    float scanned = mix(above, 1.0 - above, uInvert);
    vec3 col = mix(sculpture, xray, scanned);

    // The line itself, drawn onto the surface.
    float band = exp(-abs(d) * 140.0);
    float glow = exp(-abs(d) * 22.0) * 0.25;
    col = mix(col, uScan, clamp(band * 1.25 + glow, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const sheetFragment = /* glsl */ `
  uniform vec3 uScan;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    // falls off to nothing well inside the canvas, so no hard edges
    float a = pow(smoothstep(1.0, 0.0, r), 1.6) * uOpacity;
    // thin bright rim close to the centre plane, softer haze outward
    gl_FragColor = vec4(uScan, a * 0.18);
    #include <colorspace_fragment>
  }
`;
const sheetVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Brain({
  url,
  theme,
  reduceMotion,
  onReady,
  onScan,
  onSlow,
}: {
  url: string;
  theme: "dark" | "light";
  reduceMotion: boolean;
  onReady: () => void;
  onScan?: (progress: number) => void;
  onSlow: () => void;
}) {
  const { scene } = useLoader(GLTFLoader, url, (loader) => {
    (loader as GLTFLoader).setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uScanY: { value: 0 },
      uInvert: { value: 0 },
      uSliceDensity: { value: 26 },
      uNormalMap: { value: null as THREE.Texture | null },
      uMap: { value: null as THREE.Texture | null },
      uHasNormalMap: { value: 0 },
      uHasMap: { value: 0 },
      uBase: { value: PALETTES.dark.base.clone() },
      uShadow: { value: PALETTES.dark.shadow.clone() },
      uXray: { value: PALETTES.dark.xray.clone() },
      uScan: { value: PALETTES.dark.scan.clone() },
    }),
    [],
  );
  const sheetUniforms = useMemo(
    () => ({ uScan: uniforms.uScan, uOpacity: { value: 1 } }),
    [uniforms],
  );

  useEffect(() => {
    const p = PALETTES[theme];
    uniforms.uBase.value.copy(p.base);
    uniforms.uShadow.value.copy(p.shadow);
    uniforms.uXray.value.copy(p.xray);
    uniforms.uScan.value.copy(p.scan);
  }, [theme, uniforms]);

  // Normalise any downloaded model: centre it, scale to a unit-ish
  // radius, and give every mesh the scan material.
  const { model, halfHeight } = useMemo(() => {
    const root = scene.clone(true);
    // Reuse the model's own textures for surface detail.
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || uniforms.uNormalMap.value) return;
      const src = m.material as THREE.MeshStandardMaterial;
      if (src.normalMap) {
        uniforms.uNormalMap.value = src.normalMap;
        uniforms.uHasNormalMap.value = 1;
      }
      if (src.map) {
        uniforms.uMap.value = src.map;
        uniforms.uHasMap.value = 1;
      }
    });
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      side: THREE.DoubleSide,
    });
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = material;
        m.castShadow = false;
        m.receiveShadow = false;
        if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      }
    });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.72 / Math.max(size.x, size.y, size.z);
    root.position.sub(center.multiplyScalar(scale));
    root.scale.setScalar(scale);
    return { model: root, halfHeight: (size.y * scale) / 2 };
  }, [scene, uniforms]);

  // Report ready only after real frames have been drawn: the first
  // frames compile the shader and upload textures (a one-off GPU stall),
  // and that should happen behind the preloader, not during the reveal.
  const framesDrawn = useRef(0);
  const t0 = useRef<number | null>(null);
  // Watch real frame times after warm-up; if this device can't hold ~35fps,
  // hand over to the video so the rest of the page stays responsive.
  const slow = useRef({ frames: 0, time: 0, done: false });
  useFrame((state, delta) => {
    if (framesDrawn.current < 3 && ++framesDrawn.current === 3) onReady();
    const s = slow.current;
    if (!s.done && framesDrawn.current >= 3 && delta < 1) {
      s.frames++;
      s.time += delta;
      if (s.frames === 90) {
        s.done = true;
        if (s.time / s.frames > 1 / 35) onSlow();
      }
    }
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;

    // Scan: top → bottom, hold, fade back to the top; 7.5 s loop.
    const span = halfHeight * 1.12;
    const LOOP = 7.5;
    const phase = (t % LOOP) / LOOP;
    uniforms.uInvert.value = reduceMotion ? 0 : Math.floor(t / LOOP) % 2;
    let p: number;
    if (reduceMotion) p = 0.55;
    else if (phase < 0.72) p = easeInOut(phase / 0.72);
    else p = 1;
    uniforms.uScanY.value = span - p * span * 2;
    sheetUniforms.uOpacity.value = reduceMotion
      ? 1
      : phase < 0.72
        ? Math.min(1, phase / 0.05)
        : Math.max(0, 1 - (phase - 0.72) / 0.08);
    if (sheet.current) sheet.current.position.y = uniforms.uScanY.value;
    onScan?.(p);

    if (group.current && !reduceMotion) group.current.rotation.y += delta * 0.12;
    if (tilt.current) {
      const tx = reduceMotion ? 0 : -pointer.y * 0.12;
      const tz = reduceMotion ? 0 : pointer.x * 0.06;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.04;
      tilt.current.rotation.z += (tz - tilt.current.rotation.z) * 0.04;
    }
  });

  return (
    <group ref={tilt}>
      <group ref={group} rotation={[0, -0.6, 0]}>
        <primitive object={model} />
      </group>
      {/* Sheet of light — the scanner plane. Seen almost edge-on. */}
      <mesh ref={sheet} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[2.5, 2.5]} />
        <shaderMaterial
          vertexShader={sheetVertex}
          fragmentShader={sheetFragment}
          uniforms={sheetUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Does the model exist? SPA hosts answer missing files with index.html. */
function useModelAvailable(url: string) {
  const [state, setState] = useState<"checking" | "yes" | "no">("checking");
  useEffect(() => {
    let alive = true;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") ?? "";
        if (alive) setState(r.ok && !type.includes("text/html") ? "yes" : "no");
      })
      .catch(() => alive && setState("no"));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

// Probed once per page load (creating a GL context isn't free), cached after.
let webglOk: boolean | null = null;

function useWebGL() {
  return useMemo(() => {
    if (webglOk !== null) return webglOk;
    webglOk = probeWebGL();
    return webglOk;
  }, []);
}

function probeWebGL(): boolean {
  {
    try {
      const c = document.createElement("canvas");
      // failIfMajorPerformanceCaveat: no context if the browser would fall
      // back to software rendering (GPU blocklisted, acceleration off, VMs,
      // remote desktops). Those devices get the video instead of a 3D scene
      // that would freeze clicks.
      const opts = { failIfMajorPerformanceCaveat: true } as WebGLContextAttributes;
      const gl = (c.getContext("webgl2", opts) || c.getContext("webgl", opts)) as
        | WebGLRenderingContext
        | null;
      if (!gl) return false;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    } catch {
      return false;
    }
  }
}

/**
 * If the model or the GPU fails on a device, show the fallback instead of
 * letting the error unmount the whole app (nav included).
 */
class SceneBoundary extends Component<
  { fallback: ReactNode; onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[BrainScan] 3D scene failed, showing fallback:", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function BrainScan({
  theme,
  onReady,
  onScan,
  fallback,
  className = "",
}: {
  theme: "dark" | "light";
  onReady: () => void;
  onScan?: (progress: number) => void;
  /** Rendered if the model or WebGL is unavailable. */
  fallback: React.ReactNode;
  className?: string;
}) {
  const available = useModelAvailable(BRAIN_MODEL_URL);
  const webgl = useWebGL();
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Pause rendering while the hero is off-screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [tooSlow, setTooSlow] = useState(false);

  useEffect(() => {
    if (available === "no" || !webgl) onReady();
  }, [available, webgl, onReady]);

  if (available === "no" || !webgl || tooSlow) return <>{fallback}</>;

  return (
    <div ref={wrap} className={className}>
      {available === "yes" && (
        <SceneBoundary fallback={fallback} onError={onReady}>
        <Canvas
          dpr={[1, Math.min(window.devicePixelRatio || 1, 1.25)]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0.32, 4.6], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <Suspense fallback={null}>
            <Brain
              url={BRAIN_MODEL_URL}
              theme={theme}
              reduceMotion={reduceMotion}
              onReady={onReady}
              onScan={onScan}
              onSlow={() => setTooSlow(true)}
            />
          </Suspense>
        </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
