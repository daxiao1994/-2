import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState, ParticleData } from '../types';
import { TREE_CONFIG, COLORS, GIFT_PALETTE, NEON_PALETTE, ANIMATION_SPEED } from '../constants';

interface TreeParticlesProps {
  treeState: TreeState;
}

/**
 * Helper to generate random positions within a cone (Tree Shape)
 * and random positions within a sphere (Scatter Shape)
 */
const generateParticles = (count: number, type: 'BOX' | 'GLOW'): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < count; i++) {
    // --- 1. Calculate Tree Position (Cone) ---
    // Normalized height (0 to 1)
    const hNorm = Math.random(); 
    // Actual Y (-height/2 to height/2)
    const y = (hNorm - 0.5) * TREE_CONFIG.height;
    // Radius at this height (tapers to top)
    const rAtHeight = (1 - hNorm) * TREE_CONFIG.radius;
    
    // Boxes form the bulk, Glows float slightly outside or inside
    const rScale = type === 'GLOW' ? 0.6 + Math.random() * 0.6 : Math.random();
    const r = rAtHeight * rScale; 
    
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    const treePos = new THREE.Vector3(x, y, z);

    // --- 2. Calculate Scatter Position (Sphere) ---
    const u = Math.random();
    const v = Math.random();
    const theta_s = 2 * Math.PI * u;
    const phi_s = Math.acos(2 * v - 1);
    const r_s = Math.cbrt(Math.random()) * TREE_CONFIG.scatterRadius; 
    
    const sx = r_s * Math.sin(phi_s) * Math.cos(theta_s);
    const sy = r_s * Math.sin(phi_s) * Math.sin(theta_s);
    const sz = r_s * Math.cos(phi_s);

    const scatterPos = new THREE.Vector3(sx, sy, sz);

    // --- 3. Aesthetics ---
    const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    let scale = 1;
    let color = new THREE.Color();

    if (type === 'BOX') {
        // Varying box sizes
        scale = 0.3 + Math.random() * 0.5;
        // Random gift wrapping color
        const colorIdx = Math.floor(Math.random() * GIFT_PALETTE.length);
        color = GIFT_PALETTE[colorIdx].clone();
    } else {
        // Small glowing specks
        scale = 0.1 + Math.random() * 0.2;
        // Random neon color
        const colorIdx = Math.floor(Math.random() * NEON_PALETTE.length);
        color = NEON_PALETTE[colorIdx].clone();
    }

    particles.push({
      id: i,
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation,
      scale,
      type,
      color,
    });
  }
  return particles;
};

// Special generator for the Star
const generateStar = (): ParticleData => {
    const y = TREE_CONFIG.height / 2 + 0.5; // Top of tree
    const treePos = new THREE.Vector3(0, y, 0);
    
    // Scatter far above
    const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * 20, 
        20 + Math.random() * 10, 
        (Math.random() - 0.5) * 20
    );

    return {
        id: 9999,
        scatterPosition: scatterPos,
        treePosition: treePos,
        rotation: new THREE.Euler(0, 0, 0),
        scale: 1.5,
        type: 'STAR',
        color: COLORS.GOLD_METALLIC
    };
};

export const TreeParticles: React.FC<TreeParticlesProps> = ({ treeState }) => {
  // References
  const boxesMesh = useRef<THREE.InstancedMesh>(null);
  const glowMesh = useRef<THREE.InstancedMesh>(null);
  const starMesh = useRef<THREE.Mesh>(null);

  // Data
  const boxesData = useMemo(() => generateParticles(TREE_CONFIG.particleCount, 'BOX'), []);
  const glowData = useMemo(() => generateParticles(TREE_CONFIG.ornamentCount, 'GLOW'), []);
  const starData = useMemo(() => generateStar(), []);

  // Animation Factor
  const morphFactor = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize Colors
  useLayoutEffect(() => {
    if (boxesMesh.current) {
        boxesData.forEach((data, i) => boxesMesh.current!.setColorAt(i, data.color));
        boxesMesh.current.instanceColor!.needsUpdate = true;
    }
    if (glowMesh.current) {
        glowData.forEach((data, i) => glowMesh.current!.setColorAt(i, data.color));
        glowMesh.current.instanceColor!.needsUpdate = true;
    }
  }, [boxesData, glowData]);

  useFrame((state, delta) => {
    // 1. Lerp Logic
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    const step = delta * ANIMATION_SPEED;
    
    if (Math.abs(morphFactor.current - target) > 0.001) {
        morphFactor.current = THREE.MathUtils.lerp(morphFactor.current, target, step);
    } else {
        morphFactor.current = target; 
    }
    const t = morphFactor.current;
    
    const time = state.clock.getElapsedTime();
    const hoverY = t > 0.9 ? Math.sin(time * 0.5) * 0.2 : 0;

    // 2. Update Boxes (Gifts)
    if (boxesMesh.current) {
      for (let i = 0; i < boxesData.length; i++) {
        const { scatterPosition, treePosition, rotation, scale } = boxesData[i];
        
        dummy.position.lerpVectors(scatterPosition, treePosition, t);
        dummy.position.y += hoverY;
        
        // Boxes tumble when scattering, stabilize when tree
        const tumbleSpeed = (1 - t) * 2.0;
        dummy.rotation.set(
            rotation.x + time * tumbleSpeed, 
            rotation.y + time * tumbleSpeed, 
            rotation.z + time * tumbleSpeed
        );
        
        // Scale down slightly when scattered
        const currentScale = THREE.MathUtils.lerp(0.0, scale, t * 0.8 + 0.2);
        dummy.scale.set(currentScale, currentScale, currentScale);

        dummy.updateMatrix();
        boxesMesh.current.setMatrixAt(i, dummy.matrix);
      }
      boxesMesh.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Glow Particles
    if (glowMesh.current) {
      for (let i = 0; i < glowData.length; i++) {
        const { scatterPosition, treePosition, scale } = glowData[i];

        // Glow particles orbit slightly when tree is formed
        const orbitOffset = t * Math.sin(time + i) * 0.3;
        
        const tempTreePos = treePosition.clone();
        tempTreePos.x += Math.cos(time * 2 + i) * orbitOffset;
        tempTreePos.z += Math.sin(time * 2 + i) * orbitOffset;

        dummy.position.lerpVectors(scatterPosition, tempTreePos, t);
        dummy.position.y += hoverY;
        
        // Pulse scale
        const pulse = 1 + Math.sin(time * 3 + i) * 0.3;
        const currentScale = scale * pulse;
        
        dummy.rotation.set(0, 0, 0); // Spheres don't need rotation
        dummy.scale.set(currentScale, currentScale, currentScale);
        
        dummy.updateMatrix();
        glowMesh.current.setMatrixAt(i, dummy.matrix);
      }
      glowMesh.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Update Star
    if (starMesh.current) {
        const { scatterPosition, treePosition } = starData;
        starMesh.current.position.lerpVectors(scatterPosition, treePosition, t);
        starMesh.current.position.y += hoverY;
        
        // Star spin
        starMesh.current.rotation.y = time * 0.5;
        starMesh.current.rotation.z = Math.sin(time) * 0.1;

        // Star scale (pop in)
        const starScale = THREE.MathUtils.lerp(0.1, 1.2, t);
        starMesh.current.scale.set(starScale, starScale, starScale);
    }
  });

  return (
    <group>
      {/* Gift Boxes - Metallic and reflective */}
      <instancedMesh
        ref={boxesMesh}
        args={[undefined, undefined, boxesData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={1}
        />
      </instancedMesh>

      {/* Glow Particles - Neon Lights */}
      <instancedMesh
        ref={glowMesh}
        args={[undefined, undefined, glowData.length]}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
            toneMapped={false}
            color="white" // Base color is white, instance color tints it
            emissive="white" // Instance color will tint this via prop? No, standard material doesn't support instance emissive easily without custom shader.
            // Simplified: We rely on the base color being bright and bloom picking it up. 
            // Or we use basic material. Let's use Standard but high emissive.
            emissiveIntensity={4}
            roughness={0.1}
        />
      </instancedMesh>

      {/* The Top Star */}
      <mesh ref={starMesh} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC}
            emissive={COLORS.GOLD_METALLIC}
            emissiveIntensity={2}
            roughness={0}
            metalness={1}
        />
      </mesh>
    </group>
  );
};