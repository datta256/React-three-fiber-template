import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Spotlight Component that follows player
export default function PlayerSpotlight({ targetPosition }) {
  const spotlightRef = useRef();
  const targetRef = useRef(new THREE.Object3D());

  useFrame(() => {
    if (targetPosition && spotlightRef.current) {
      // Move spotlight above player
      spotlightRef.current.position.set(targetPosition.x, 5, targetPosition.z);
      // Move spotlight target to player
      targetRef.current.position.copy(targetPosition);
      spotlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <spotLight
        ref={spotlightRef}
        angle={Math.PI / 5}
        intensity={400}
        distance={10}
        penumbra={1-Math.PI / 5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        target={targetRef.current}
      />
      <primitive object={targetRef.current} />
    </>
  );
}
