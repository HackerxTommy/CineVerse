import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D MOVIES ASSETS ---

// A Classic Film Reel (Gold/Metallic)
const FilmReel = ({ position, rotation, scale = 1, color = "#FFD700" }) => {
    const group = useRef();

    useFrame(() => {
        // Slow, elegant rotation
        group.current.rotation.z += 0.005;
    });

    return (
        <group ref={group} position={position} rotation={rotation} scale={scale}>
            {/* Outer Rims */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
                <torusGeometry args={[2, 0.1, 16, 100]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]}>
                <torusGeometry args={[2, 0.1, 16, 100]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Central Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.6, 32]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Film Stock (Dark fill inside) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.8, 1.8, 0.35, 32]} />
                <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
            </mesh>

            {/* Spokes (Decorative holes) */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                    <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
                        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// A winding Film Strip (Abstract Ribbon)
const FilmStripRibbon = ({ position, color = "#111" }) => {
    const mesh = useRef();

    // Create a wavy curve
    const curve = useMemo(() => {
        const points = [];
        for (let i = 0; i < 10; i++) {
            points.push(
                new THREE.Vector3(
                    Math.sin(i * 0.5) * 5 + (i - 5) * 2,
                    Math.cos(i * 0.3) * 3,
                    Math.sin(i * 0.8) * 4
                )
            );
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    useFrame((state) => {
        mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
        mesh.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.05) * 0.1;
    });

    return (
        <group position={position}>
            <mesh ref={mesh}>
                <tubeGeometry args={[curve, 64, 0.6, 4, false]} />
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.6}
                    roughness={0.2}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

// Dramatic Spotlight Beams
const SearchLight = ({ position, color = "#fff", delay = 0 }) => {
    const ref = useRef();

    useFrame(({ clock }) => {
        const t = clock.elapsedTime + delay;
        // Sweep motion
        ref.current.rotation.z = Math.sin(t * 0.5) * 0.6; // Swing left/right
        ref.current.rotation.x = Math.PI / -6 + Math.cos(t * 0.3) * 0.2; // Tilt
    });

    return (
        <group position={position} ref={ref}>
            {/* Source Housing */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 0.6]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* The Light Beam */}
            <mesh position={[0, 4, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[1.5, 0.2, 9, 32, 1, true]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

const HeroScene = () => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: 0,
            background: 'linear-gradient(135deg, #050505 0%, #0a0a12 50%, #1a0b0b 100%)', // Deep rich dark background
            overflow: 'hidden'
        }}>
            <Canvas
                shadows
                camera={{ position: [0, 0, 12], fov: 50 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
            >
                {/* Cinematic Lighting */}
                <ambientLight intensity={0.2} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.5}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    color="#ffd700" /* Gold tint */
                />
                <pointLight position={[-10, -5, -10]} intensity={1} color="#e50914" /> {/* Red Rim Light */}
                <Environment preset="city" />

                {/* --- 3D SCENE CONTENT --- */}

                {/* Floating Film Reels - The Hero Objects */}
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <FilmReel position={[-4, 1, -2]} rotation={[0.4, 0.5, 0]} scale={1.2} color="#FFD700" />
                    <FilmReel position={[5, -2, -4]} rotation={[-0.2, -0.4, 0]} scale={0.9} color="#C0C0C0" />
                    {/* Distant dark reel */}
                    <FilmReel position={[0, 4, -8]} rotation={[0, 0, 0.5]} scale={1.5} color="#333" />
                </Float>

                {/* Abstract Film Ribbon Flowing Through */}
                <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                    <FilmStripRibbon position={[0, 0, -5]} color="#080808" />
                </Float>

                {/* Moving Spotlight Beams (Premiere style) */}
                <group position={[0, -8, -5]} rotation={[0, 0, 0]}>
                    <SearchLight position={[-6, 0, 0]} color="#fff" delay={0} />
                    <SearchLight position={[6, 0, 0]} color="#d4af37" delay={2} />
                    <SearchLight position={[0, 0, -4]} color="#e50914" delay={4} />
                </group>

                {/* Abstract Glass/Crystal shapes for "Classy" refractions */}
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={[-6, -3, 0]}>
                        <octahedronGeometry args={[1]} />
                        <MeshDistortMaterial
                            color="white"
                            envMapIntensity={1}
                            clearcoat={1}
                            transparent
                            opacity={0.6}
                            distort={0.3}
                            speed={2}
                        />
                    </mesh>
                    <mesh position={[7, 3, 2]}>
                        <icosahedronGeometry args={[0.8]} />
                        <MeshDistortMaterial
                            color="#e50914"
                            envMapIntensity={1}
                            clearcoat={1}
                            transparent
                            opacity={0.4}
                            distort={0.4}
                            speed={2}
                        />
                    </mesh>
                </Float>

                {/* Subtle fog for depth, not particles */}
                <fog attach="fog" args={['#050505', 10, 30]} />
            </Canvas>

            {/* Vignette Overlay for Cinema Look */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default HeroScene;
