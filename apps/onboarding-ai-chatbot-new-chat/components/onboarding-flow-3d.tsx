"use client";

import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Animated particle system representing data flow
function ParticleFlow() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles along a path
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Blue color palette
      colors[i * 3] = 0.2 + Math.random() * 0.3; // R
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.4; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < count; i++) {
        // Move particles in a flowing motion
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        positions[i * 3 + 1] +=
          Math.cos(state.clock.elapsedTime + i * 0.5) * 0.01;

        // Reset particles that go too far
        if (positions[i * 3] > 10) positions[i * 3] = -10;
        if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = -5;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          array={particles.positions}
          attach="attributes-position"
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          array={particles.colors}
          attach="attributes-color"
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        opacity={0.6}
        size={0.1}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  );
}

// Stage 1: Checklist representation
function ChecklistStage() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float floatIntensity={0.5} rotationIntensity={0.5} speed={2}>
      <group position={[-6, 0, 0]} ref={groupRef}>
        {/* Checklist boxes */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.8 - 0.8, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial
              color={i === 2 ? "#3b82f6" : "#60a5fa"}
              emissive={i === 2 ? "#3b82f6" : "#1e40af"}
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        ))}
        {/* Checkmark */}
        <mesh position={[0, 0.8, 0.4]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Stage 2: AI Chat representation
function AIChatStage() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Float floatIntensity={0.8} rotationIntensity={0.3} speed={1.5}>
      <group position={[-2, 0, 0]} ref={groupRef}>
        {/* Chat bubbles */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <MeshTransmissionMaterial
            chromaticAberration={0.1}
            color="#3b82f6"
            ior={1.5}
            roughness={0.2}
            thickness={0.5}
            transmission={0.9}
          />
        </mesh>
        <mesh position={[0.3, -0.3, 0.2]} scale={0.7}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* AI sparkle */}
        <mesh position={[0, 1, 0]}>
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Stage 3: Knowledge Base representation
function KnowledgeBaseStage() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float floatIntensity={0.6} rotationIntensity={0.4} speed={1.8}>
      <group position={[2, 0, 0]} ref={groupRef}>
        {/* Book/document stack */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, i * 0.3 - 0.3, 0]}
            rotation={[0, i * 0.2, 0]}
          >
            <boxGeometry args={[1, 0.2, 0.7]} />
            <meshStandardMaterial
              color={`hsl(${220 + i * 10}, 80%, ${60 - i * 5}%)`}
              emissive="#1e40af"
              emissiveIntensity={0.1}
              metalness={0.2}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Stage 4: Group Chat representation
function GroupChatStage() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float floatIntensity={0.7} rotationIntensity={0.6} speed={2.2}>
      <group position={[6, 0, 0]} ref={groupRef}>
        {/* Connected nodes representing people */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const radius = 1;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            >
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color="#3b82f6"
                emissive="#2563eb"
                emissiveIntensity={0.3}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          );
        })}
        {/* Connection lines */}
        <mesh>
          <torusGeometry args={[1, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Connecting path/flow line
function FlowPath() {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity =
        0.3 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, -2, 0),
      new THREE.Vector3(-2, -2, 0),
      new THREE.Vector3(2, -2, 0),
      new THREE.Vector3(6, -2, 0),
    ]);
    return curve.getPoints(50);
  }, []);

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          attach="attributes-position"
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#3b82f6"
        linewidth={2}
        opacity={0.5}
        transparent
      />
    </line>
  );
}

export default function OnboardingFlow3D() {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight color="#60a5fa" intensity={1} position={[10, 10, 10]} />
        <pointLight
          color="#3b82f6"
          intensity={0.5}
          position={[-10, -10, -10]}
        />
        <spotLight
          angle={0.3}
          color="#93c5fd"
          intensity={1}
          penumbra={1}
          position={[0, 10, 0]}
        />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Particle flow background */}
        <ParticleFlow />

        {/* Onboarding stages */}
        <ChecklistStage />
        <AIChatStage />
        <KnowledgeBaseStage />
        <GroupChatStage />

        {/* Flow path */}
        <FlowPath />

        {/* Camera controls */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
