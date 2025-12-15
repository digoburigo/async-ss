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
					attach="attributes-position"
					count={count}
					array={particles.positions}
					itemSize={3}
				/>
				<bufferAttribute
					attach="attributes-color"
					count={count}
					array={particles.colors}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.1}
				vertexColors
				transparent
				opacity={0.6}
				sizeAttenuation
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
		<Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
			<group ref={groupRef} position={[-6, 0, 0]}>
				{/* Checklist boxes */}
				{[0, 1, 2].map((i) => (
					<mesh key={i} position={[0, i * 0.8 - 0.8, 0]}>
						<boxGeometry args={[0.6, 0.6, 0.6]} />
						<meshStandardMaterial
							color={i === 2 ? "#3b82f6" : "#60a5fa"}
							metalness={0.3}
							roughness={0.4}
							emissive={i === 2 ? "#3b82f6" : "#1e40af"}
							emissiveIntensity={0.2}
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
		<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
			<group ref={groupRef} position={[-2, 0, 0]}>
				{/* Chat bubbles */}
				<mesh position={[0, 0.5, 0]}>
					<sphereGeometry args={[0.5, 32, 32]} />
					<MeshTransmissionMaterial
						color="#3b82f6"
						thickness={0.5}
						roughness={0.2}
						transmission={0.9}
						ior={1.5}
						chromaticAberration={0.1}
					/>
				</mesh>
				<mesh position={[0.3, -0.3, 0.2]} scale={0.7}>
					<sphereGeometry args={[0.5, 32, 32]} />
					<meshStandardMaterial
						color="#60a5fa"
						metalness={0.5}
						roughness={0.3}
						emissive="#3b82f6"
						emissiveIntensity={0.3}
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
		<Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
			<group ref={groupRef} position={[2, 0, 0]}>
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
							metalness={0.2}
							roughness={0.5}
							emissive="#1e40af"
							emissiveIntensity={0.1}
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
		<Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.7}>
			<group ref={groupRef} position={[6, 0, 0]}>
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
								metalness={0.4}
								roughness={0.3}
								emissive="#2563eb"
								emissiveIntensity={0.3}
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
					attach="attributes-position"
					count={points.length}
					array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
					itemSize={3}
				/>
			</bufferGeometry>
			<lineBasicMaterial
				color="#3b82f6"
				transparent
				opacity={0.5}
				linewidth={2}
			/>
		</line>
	);
}

export default function OnboardingFlow3D() {
	return (
		<div className="w-full h-[600px] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-2xl overflow-hidden shadow-2xl">
			<Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
				{/* Lighting */}
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
				<pointLight
					position={[-10, -10, -10]}
					intensity={0.5}
					color="#3b82f6"
				/>
				<spotLight
					position={[0, 10, 0]}
					angle={0.3}
					penumbra={1}
					intensity={1}
					color="#93c5fd"
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
					enableZoom={false}
					enablePan={false}
					minPolarAngle={Math.PI / 3}
					maxPolarAngle={Math.PI / 1.5}
					autoRotate
					autoRotateSpeed={0.5}
				/>
			</Canvas>
		</div>
	);
}
