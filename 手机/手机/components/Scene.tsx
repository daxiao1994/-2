import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black to-[#00100a]">
      <Canvas
        shadows
        camera={{ position: [0, 2, 25], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }}
        dpr={[1, 2]} // Optimization for varying screen densities
      >
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Main warm spot light for gold highlights */}
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
            color="#ffeebb"
        />
        
        {/* Backlight for rim effect (Emerald) */}
        <pointLight position={[-10, 5, -10]} intensity={2} color="#00ff88" distance={30} />
        
        {/* Fill light */}
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#444444" />

        <Suspense fallback={null}>
            <TreeParticles treeState={treeState} />
            
            {/* Background Atmosphere */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" /> 
        </Suspense>

        <ContactShadows 
            resolution={1024} 
            scale={50} 
            blur={2} 
            opacity={0.5} 
            far={10} 
            color="#000000" 
        />

        <OrbitControls 
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={treeState === TreeState.TREE_SHAPE ? 0.8 : 0.2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
        />

        {/* Post Processing for Cinematic Feel */}
        <EffectComposer enableNormalPass={false}>
            {/* High bloom for that magical glow on the gold */}
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.4}
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};