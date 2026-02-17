import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating glass-like geometric shapes (No particles, just classy 3D)
const FloatingShapes = ({ variant }) => {
    const groupRef = useRef();

    const shapes = useMemo(() => {
        const colors = {
            default: ['#e50914', '#b20710'],
            blue: ['#00f2ea', '#0088ff'],
            purple: ['#ff00ff', '#8b5cf6'],
            gold: ['#d4af37', '#f59e0b']
        };

        const colorSet = colors[variant] || colors.default;

        return Array.from({ length: 6 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                Math.random() * -5
            ],
            scale: 0.5 + Math.random() * 0.8,
            color: colorSet[i % colorSet.length],
            type: ['icosa', 'octa', 'torus'][i % 3]
        }));
    }, [variant]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <Float key={i} speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
                    <mesh position={shape.position} scale={shape.scale}>
                        {shape.type === 'icosa' && <icosahedronGeometry args={[1, 0]} />}
                        {shape.type === 'octa' && <octahedronGeometry args={[1, 0]} />}
                        {shape.type === 'torus' && <torusGeometry args={[0.7, 0.2, 16, 32]} />}

                        {/* Classy Refractive Material */}
                        <MeshDistortMaterial
                            color={shape.color}
                            envMapIntensity={1}
                            clearcoat={1}
                            clearcoatRoughness={0.1}
                            metalness={0.1}
                            roughness={0.2}
                            transparent
                            opacity={0.15} /* Subtle */
                            distort={0.4}
                            speed={1.5}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

// Subtle Light Rays (Static, low opacity)
const AmbientRays = ({ variant }) => {
    const colorMap = {
        default: '#e50914',
        blue: '#00f2ea',
        purple: '#a855f7',
        gold: '#d4af37'
    };
    const c = colorMap[variant] || '#fff';

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <mesh position={[0, 0, -8]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial
                    color={c}
                    transparent
                    opacity={0.03}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
};

const AnimatedBackground = ({ variant = 'default' }) => {
    const bgGradients = {
        default: 'linear-gradient(135deg, #050505 0%, #1a0505 100%)',
        blue: 'linear-gradient(135deg, #050505 0%, #050a1a 100%)',
        purple: 'linear-gradient(135deg, #050505 0%, #1a051a 100%)',
        gold: 'linear-gradient(135deg, #050505 0%, #1a1a05 100%)'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: bgGradients[variant] || bgGradients.default
        }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Clean, classy 3D shapes */}
                <FloatingShapes variant={variant} />

                {/* Subtle atmosphere */}
                <AmbientRays variant={variant} />

                {/* No particles, stars, or sparkles */}
            </Canvas>

            {/* Soft Grain Overlay for Film Look */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
            }} />
        </div>
    );
};

export default AnimatedBackground;
