import * as THREE from 'three';

// Arix Signature Palette
export const COLORS = {
  EMERALD_DEEP: new THREE.Color('#002415'),
  EMERALD_LITE: new THREE.Color('#005c38'),
  GOLD_METALLIC: new THREE.Color('#FFD700'),
  GOLD_ROSE: new THREE.Color('#C5A059'),
  VOID: '#000502',
};

// New Palettes
export const GIFT_PALETTE = [
  new THREE.Color('#8a0000'), // Deep Red
  new THREE.Color('#003311'), // Deep Green
  new THREE.Color('#d4af37'), // Gold
  new THREE.Color('#ffffff'), // Silver/White
  new THREE.Color('#1a1a1a'), // Black wrapping
];

export const NEON_PALETTE = [
  new THREE.Color('#ff00ff'), // Magenta
  new THREE.Color('#00ffff'), // Cyan
  new THREE.Color('#ffff00'), // Yellow
  new THREE.Color('#ff3333'), // Red Glow
  new THREE.Color('#33ff33'), // Lime
];

// Configuration for the tree generation
export const TREE_CONFIG = {
  height: 12,
  radius: 4.5,
  particleCount: 1500, // Number of boxes (slightly reduced from needles for bulk)
  ornamentCount: 300,   // Increased count for magical glow particles
  scatterRadius: 25,    // How far particles fly out
};

export const ANIMATION_SPEED = 2.5; // Lerp speed factor