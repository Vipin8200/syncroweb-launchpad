import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ParticleNetwork = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const particleCount = 60;
  const connectionDistance = 2.2;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    return { positions, velocities };
  }, []);

  const linePositions = useMemo(() => {
    return new Float32Array(particleCount * particleCount * 6);
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current || !linesRef.current) return;

    mouseRef.current = {
      x: pointer.x * viewport.width * 0.5,
      y: pointer.y * viewport.height * 0.5,
    };

    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    // Update particle positions - very slow motion
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Mouse interaction - subtle
      const dx = mouseRef.current.x - posArray[i * 3];
      const dy = mouseRef.current.y - posArray[i * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 2.5) {
        posArray[i * 3] -= dx * 0.001;
        posArray[i * 3 + 1] -= dy * 0.001;
      }

      // Boundary wrapping
      if (posArray[i * 3] > 5) posArray[i * 3] = -5;
      if (posArray[i * 3] < -5) posArray[i * 3] = 5;
      if (posArray[i * 3 + 1] > 3.5) posArray[i * 3 + 1] = -3.5;
      if (posArray[i * 3 + 1] < -3.5) posArray[i * 3 + 1] = 3.5;
      if (posArray[i * 3 + 2] > 2) posArray[i * 3 + 2] = -2;
      if (posArray[i * 3 + 2] < -2) posArray[i * 3 + 2] = 2;
    }

    posAttr.needsUpdate = true;

    // Update connections
    const lineAttr = linesRef.current.geometry.attributes.position;
    const lineArray = lineAttr.array as Float32Array;
    let lineIndex = 0;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance && lineIndex < linePositions.length - 6) {
          lineArray[lineIndex++] = posArray[i * 3];
          lineArray[lineIndex++] = posArray[i * 3 + 1];
          lineArray[lineIndex++] = posArray[i * 3 + 2];
          lineArray[lineIndex++] = posArray[j * 3];
          lineArray[lineIndex++] = posArray[j * 3 + 1];
          lineArray[lineIndex++] = posArray[j * 3 + 2];
        }
      }
    }

    // Clear remaining line positions
    for (let i = lineIndex; i < lineArray.length; i++) {
      lineArray[i] = 0;
    }

    lineAttr.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, lineIndex / 3);

    // Very gentle rotation
    pointsRef.current.rotation.y = clock.elapsedTime * 0.01;
    linesRef.current.rotation.y = clock.elapsedTime * 0.01;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#0F172A"
          transparent
          opacity={0.15}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#4F46E5"
          transparent
          opacity={0.12}
        />
      </lineSegments>
    </>
  );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticleNetwork />
      </Canvas>
      
      {/* Subtle gradient overlays for light theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
    </div>
  );
};

export default ThreeBackground;