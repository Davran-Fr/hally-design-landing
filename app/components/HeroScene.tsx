'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ── House Model ────────────────────────────────────────────────────────── */
function HouseModel({ onReady }: { onReady: (sphere: THREE.Sphere) => void }) {
  const { scene } = useGLTF('/House_03.gltf');
  const ref = useRef<THREE.Group>(null!);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.5 / maxDim;

    scene.position.set(-center.x * scale, -center.y * scale + 0.1, -center.z * scale);
    scene.scale.setScalar(scale);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Pass bounding sphere to camera fitter
    const sphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(scene).getBoundingSphere(sphere);
    onReady(sphere);
  }, [scene, onReady]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return <primitive ref={ref} object={scene} />;
}

/* ── Auto-fit Camera ────────────────────────────────────────────────────── */
function FitCamera({ sphere }: { sphere: THREE.Sphere | null }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!sphere) return;
    const cam = camera as THREE.PerspectiveCamera;
    const fovRad = (cam.fov * Math.PI) / 180;
    const aspect = size.width / size.height;

    // Distance to fit sphere vertically and horizontally
    const distV = sphere.radius / Math.tan(fovRad / 2);
    const distH = sphere.radius / (Math.tan(fovRad / 2) * aspect);
    const dist = Math.max(distV, distH) * 1.35;

    const { x, y, z } = sphere.center;
    camera.position.set(x, y + sphere.radius * 0.25, z + dist);
    camera.lookAt(x, y, z);
  }, [sphere, camera, size]);

  return null;
}

/* ── Lights ─────────────────────────────────────────────────────────────── */
function Lights() {
  return (
    <>
      <ambientLight intensity={1.8} color="#ffffff" />
      <directionalLight position={[5, 8, 5]}   intensity={3.5} color="#ffe8c0" castShadow shadow-mapSize={[2048,2048]} shadow-bias={-0.001} />
      <directionalLight position={[-5, 4, -3]} intensity={2.0} color="#cce8ff" />
      <directionalLight position={[0, -3, 5]}  intensity={1.0} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={2.0} color="#ffffff" />
    </>
  );
}

/* ── Particles ──────────────────────────────────────────────────────────── */
function Particles() {
  const count = 60;
  const positions = useRef<Float32Array>(
    new Float32Array(
      Array.from({ length: count * 3 }, (_, i) =>
        i % 3 === 1 ? Math.random() * 6 - 1 : (Math.random() - 0.5) * 14
      )
    )
  );
  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < count * 3; i += 3) {
        pos[i] += 0.003;
        if (pos[i] > 5) pos[i] = -1;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#94a3b8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Loading Fallback ───────────────────────────────────────────────────── */
function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.8;
      ref.current.rotation.x = state.clock.elapsedTime * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1f7872" wireframe transparent opacity={0.6} />
    </mesh>
  );
}

/* ── Main Export ────────────────────────────────────────────────────────── */
export default function HeroScene() {
  const [loaded, setLoaded] = useState(false);
  const [sphere, setSphere] = useState<THREE.Sphere | null>(null);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#ffffff' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#ffffff', zIndex: 10
        }}>
          <div style={{
            width: 48, height: 48, border: '3px solid #e2e8f0',
            borderTop: '3px solid #64748b', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>Loading</span>
        </div>
      )}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 2, 12] }}
        style={{ width: '100%', height: '100%' }}
        onCreated={() => setLoaded(true)}
      >
        <color attach="background" args={['#ffffff']} />

        <FitCamera sphere={sphere} />
        <Lights />

        <Suspense fallback={<LoadingMesh />}>
          <HouseModel onReady={setSphere} />
        </Suspense>

        <Particles />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 8}
          dampingFactor={0.05}
          enableDamping
          rotateSpeed={0.6}
        />
      </Canvas>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
