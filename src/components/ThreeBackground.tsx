import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4F46E5"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const icosaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.3;
    }
    
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.15;
      torusRef.current.rotation.z = time * 0.25;
      torusRef.current.position.y = Math.sin(time * 0.4 + 1) * 0.2;
    }
    
    if (icosaRef.current) {
      icosaRef.current.rotation.y = time * 0.2;
      icosaRef.current.rotation.z = time * 0.1;
      icosaRef.current.position.y = Math.sin(time * 0.6 + 2) * 0.25;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[-2, 0, -2]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#4F46E5"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      <mesh ref={torusRef} position={[2.5, 0.5, -1]}>
        <torusGeometry args={[0.4, 0.15, 16, 32]} />
        <meshStandardMaterial
          color="#06B6D4"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
      
      <mesh ref={icosaRef} position={[0, -1, -3]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </>
  );
}

function AnimatedLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  const lines = useMemo(() => {
    const lineData = [];
    for (let i = 0; i < 20; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 8;
      const startY = (Math.random() - 0.5) * 6;
      const startZ = (Math.random() - 0.5) * 4 - 2;
      
      for (let j = 0; j < 5; j++) {
        points.push(new THREE.Vector3(
          startX + j * 0.3,
          startY + Math.sin(j * 0.5) * 0.2,
          startZ
        ));
      }
      lineData.push(points);
    }
    return lineData;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={linesRef}>
      {lines.map((points, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4F46E5" transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
}

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#06B6D4" />
        
        <ParticleField />
        <FloatingGeometry />
        <AnimatedLines />
      </Canvas>
      
      {/* Gradient overlay for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background pointer-events-none" />
    </div>
  );
};

export default ThreeBackground;
