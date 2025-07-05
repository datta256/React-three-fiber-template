import { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export default function Enemy({ position = [2, 1, 2] }) {
  const gltf = useGLTF('/Enemy.glb');
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const modelRef = useRef();
  const [health, setHealth] = useState(100);
  const positionRef = useRef(new THREE.Vector3(...position));
  const lastHit = useRef(0);
  const isDead = useRef(false);
  const isBeingHit = useRef(false);
  const currentAction = useRef('Idle');




  const playAnimation = (name, loopOnce = false) => {
    if (currentAction.current === name) return;

    actions[currentAction.current]?.fadeOut(0.2);

    const action = actions[name];
    if (!action) return;

    action.reset().fadeIn(0.3);

    if (loopOnce) {
      action.clampWhenFinished = true;
      action.setLoop(THREE.LoopOnce, 1);
    } else {
      action.setLoop(THREE.LoopRepeat);
    }

    action.play();
    currentAction.current = name;
  };

  const handleAttack = (e) => {
    if (isDead.current || isBeingHit.current) return;

    const { position: playerPos } = e.detail;
    const dist = playerPos.distanceTo(positionRef.current);

    if (dist < 1.5 && Date.now() - lastHit.current > 800) {
      lastHit.current = Date.now();
      isBeingHit.current = true;  // Lock while being hit

      setHealth(prev => {
        const newHealth = Math.max(prev - 10, 0);

        if (newHealth === 0) {
          isDead.current = true;
          playAnimation('die', true);
        } else {
          playAnimation('hit', true);

          // Automatically return to idle after hit finishes
          actions['hit']?.getMixer().addEventListener('finished', () => {
            if (!isDead.current) {
              playAnimation('Idle');
              isBeingHit.current = false;  // Unlock after hit
            }
          }, { once: true });
        }

        return newHealth;
      });
    }
  };

useEffect(() => {
  modelRef.current.position.copy(positionRef.current);

  // Reset flags & health
  isDead.current = false;
  isBeingHit.current = false;
  setHealth(100);

  // Reset all actions to T-pose frame
  Object.values(actions).forEach(action => {
    action.stop();
  });

  // Play idle once model and actions are ready
  const waitForAnimations = () => {
    if (actions['idle']) {
      playAnimation('idle');
    } else {
      requestAnimationFrame(waitForAnimations);
    }
  };

  waitForAnimations();

  window.addEventListener('playerAttack', handleAttack);
  return () => window.removeEventListener('playerAttack', handleAttack);
}, [actions]);



  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      scale={0.01}
      receiveShadow
    />
  );
}
