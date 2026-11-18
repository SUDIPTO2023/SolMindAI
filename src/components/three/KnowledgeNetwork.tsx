"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { TopicStatus } from "@/types/learning";
import { HERO_ANIMATED_TOPIC, NETWORK_EDGES, NETWORK_NODES, heroNodeColor } from "./network-geometry";
import { NetworkFallback } from "./NetworkFallback";
import { useLanguage } from "@/i18n/use-language";
import { useThemeStore } from "@/theme/theme-store";

// Original 3D knowledge network for the landing hero.
// Nodes are the demo's 11 Physics topics; lines are prerequisite links;
// small pulses travel from each prerequisite towards the topic that needs it.

const LABELLED: Record<string, string> = {
  "net-force": "Net Force",
  "second-law": "Newton's Second Law",
  friction: "Friction",
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

/**
 * A topic name drawn into a texture and shown as a sprite, so it always faces
 * the camera and is cleaned up with the rest of the scene.
 */
function Label({ text, offset }: { text: string; offset: number }) {
  const theme = useThemeStore((s) => s.theme);
  const { texture, aspect } = useMemo(() => {
    const light = theme === "light";
    const scale = 4;
    const font = `500 ${11 * scale}px ui-monospace, "SFMono-Regular", Menlo, "Hind Siliguri", "Noto Sans Bengali", monospace`;
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    g.font = font;
    const padX = 9 * scale;
    const w = Math.ceil(g.measureText(text).width + padX * 2);
    const h = 22 * scale;
    c.width = w;
    c.height = h;
    g.font = font;
    g.fillStyle = light ? "rgba(255, 255, 255, 0.92)" : "rgba(8, 11, 22, 0.78)";
    g.strokeStyle = light ? "rgba(118, 87, 232, 0.35)" : "rgba(148, 163, 184, 0.28)";
    g.lineWidth = scale;
    g.beginPath();
    g.roundRect(scale, scale, w - scale * 2, h - scale * 2, h / 2);
    g.fill();
    g.stroke();
    g.fillStyle = light ? "#302858" : "#94A3B8";
    g.textBaseline = "middle";
    g.fillText(text, padX, h / 2 + scale * 0.5);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { texture: t, aspect: w / h };
  }, [text, theme]);
  useEffect(() => () => texture.dispose(), [texture]);
  const height = 0.36;
  return (
    <sprite position={[0, offset, 0]} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function Node({
  id,
  position,
  status,
  glow,
}: {
  id: string;
  position: [number, number, number];
  status: TopicStatus;
  glow: THREE.Texture;
}) {
  const i18n = useLanguage();
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.SpriteMaterial>(null);
  const target = useMemo(() => new THREE.Color(), []);
  const isTarget = id === "second-law";
  // additive glow vanishes on a light page, so the light theme blends normally
  const light = useThemeStore((s) => s.theme) === "light";
  const isAnimated = id === HERO_ANIMATED_TOPIC;
  const radius = isTarget ? 0.32 : isAnimated ? 0.27 : 0.2;
  const initial = heroNodeColor(id, status);

  // Ease the colour towards its status colour so status changes feel continuous.
  useFrame((state, delta) => {
    target.set(heroNodeColor(id, status));
    const k = Math.min(1, delta * 3);
    mat.current?.color.lerp(target, k);
    mat.current?.emissive.lerp(target, k);
    if (halo.current) {
      halo.current.color.lerp(target, k);
      if (isAnimated) halo.current.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.18;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial ref={mat} color={initial} emissive={initial} emissiveIntensity={0.85} roughness={0.35} />
      </mesh>
      <sprite scale={radius * 9}>
        <spriteMaterial
          ref={halo}
          map={glow}
          color={initial}
          transparent
          opacity={0.5}
          depthWrite={false}
          key={light ? "halo-light" : "halo-dark"}
          blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </sprite>
      {LABELLED[id] && <Label text={i18n.tx(LABELLED[id])} offset={-radius - 0.42} />}
    </group>
  );
}

function Links() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    NETWORK_EDGES.forEach(([a, b]) => pts.push(...NETWORK_NODES[a].position, ...NETWORK_NODES[b].position));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#8B5CF6" transparent opacity={0.4} />
    </lineSegments>
  );
}

function Pulses({ still }: { still: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const paths = useMemo(
    () =>
      NETWORK_EDGES.map(([a, b], i) => ({
        from: new THREE.Vector3(...NETWORK_NODES[a].position),
        to: new THREE.Vector3(...NETWORK_NODES[b].position),
        offset: i / NETWORK_EDGES.length,
      })),
    [],
  );
  useFrame(({ clock }) => {
    if (still) return;
    paths.forEach((p, i) => {
      const k = (clock.elapsedTime * 0.2 + p.offset) % 1;
      refs.current[i]?.position.lerpVectors(p.from, p.to, k);
    });
  });
  return (
    <>
      {paths.map((p, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }} position={p.from}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#22D3EE" />
        </mesh>
      ))}
    </>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const light = useThemeStore((s) => s.theme) === "light";
  const geometry = useMemo(() => {
    const pts: number[] = [];
    // A fixed pseudo-random sequence keeps the layout identical on every visit.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
    for (let i = 0; i < 320; i++) pts.push(rand() * 22, rand() * 14, rand() * 12 - 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={light ? "#9C88F0" : "#94A3B8"} size={0.035} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Scene({ status, still }: { status: TopicStatus; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  const { camera, size } = useThree();

  // Pull the camera back on narrow screens so the whole network fits.
  useEffect(() => {
    camera.position.set(0, 0, size.width / size.height < 0.9 ? 19 : 14.5);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  // Slow orbit plus a gentle pointer parallax.
  useFrame(({ clock, pointer }) => {
    const g = group.current;
    if (!g || still) return;
    const t = clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.sin(t * 0.16) * 0.45 + pointer.x * 0.3, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.15, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[-6, 5, 6]} intensity={60} color="#8B5CF6" />
      <pointLight position={[6, -2, 5]} intensity={45} color="#3B82F6" />
      <pointLight position={[0, -5, 3]} intensity={30} color="#22D3EE" />
      <Dust />
      <group ref={group}>
        <Float enabled={!still} speed={1.2} rotationIntensity={0.08} floatIntensity={0.35}>
          <Links />
          <Pulses still={still} />
          {NETWORK_NODES.map((n) => (
            <Node key={n.id} id={n.id} position={n.position} status={status} glow={glow} />
          ))}
        </Float>
      </group>
    </>
  );
}

/** Falls back to the static network if anything inside the 3D scene throws. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function KnowledgeNetwork({ status }: { status: TopicStatus }) {
  // This file is loaded on the client only, so browser checks are safe here.
  const [supported] = useState(hasWebGL);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // Stop rendering when the hero is scrolled out of view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fallback = <NetworkFallback animatedStatus={status} />;
  if (!supported) return fallback;

  return (
    <div ref={box} className="h-full w-full">
      <SceneBoundary fallback={fallback}>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 14.5], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          frameloop={!visible ? "never" : still ? "demand" : "always"}
          fallback={fallback}
          aria-hidden="true"
        >
          <Scene status={status} still={still} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
