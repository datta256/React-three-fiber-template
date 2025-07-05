import { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import HealthBar from './HealthBar';
import * as THREE from 'three';

export default function Enemy({ targetPosition }) {
  const gltf = useGLTF('/Enemy.glb');
  const { actions } = useAnimations(gltf.animations, gltf.scene);

  const groupRef = useRef();
  const positionRef = useRef(new THREE.Vector3(2, 1, 2));
  const velocity = 0.03;

  const [health, setHealth] = useState(100);
  const isDead = useRef(false);
  const isAttacking = useRef(false);
  const currentAction = useRef(null);
  const attackCooldown = useRef(0);

  const playAnimation = (name, loopOnce = false) => {
    if (!actions[name] || currentAction.current === name) return;

    actions[currentAction.current]?.fadeOut(0.2);
    const action = actions[name];
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

  const takeDamage = () => {
    if (isDead.current) return;

    setHealth(prev => {
      const newHealth = Math.max(prev - 10, 0);

      if (newHealth === 0) {
        isDead.current = true;
        isAttacking.current = false;
        playAnimation('die', true);
      } else {
        playAnimation('hit', true);
        actions['hit']?.getMixer().addEventListener('finished', () => {
          if (!isDead.current) {
            playAnimation('Idle');
            isAttacking.current = false;
          }
        }, { once: true });
      }
      return newHealth;
    });
  };

  useEffect(() => {
    const handlePlayerAttack = (e) => {
      const { position: playerPos, forward } = e.detail;
      const dist = playerPos.distanceTo(positionRef.current);

      const enemyDir = new THREE.Vector3().subVectors(playerPos, positionRef.current).normalize();
      const dot = forward.dot(enemyDir);

      if (dist < 1.5 && dot > 0.5) {
        takeDamage();
      }
    };

    window.addEventListener('playerAttack', handlePlayerAttack);
    playAnimation('Idle');

    return () => window.removeEventListener('playerAttack', handlePlayerAttack);
  }, [actions]);

  useFrame(() => {
    if (!groupRef.current || isDead.current || !targetPosition) return;

    const dist = positionRef.current.distanceTo(targetPosition);

    if (dist > 1.5 && !isAttacking.current) {
      const direction = new THREE.Vector3().subVectors(targetPosition, positionRef.current).normalize();
      positionRef.current.add(direction.multiplyScalar(velocity));
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.rotation.y = Math.atan2(direction.x, direction.z);

      playAnimation('sprint');
    } else if (!isAttacking.current && dist <= 1.5) {
      if (Date.now() - attackCooldown.current > 1500) {
        isAttacking.current = true;
        attackCooldown.current = Date.now();
        const attackType = Math.random() > 0.5 ? 'Punch' : 'kick';
        playAnimation(attackType, true);

        actions[attackType]?.getMixer().addEventListener('finished', () => {
          isAttacking.current = false;
          if (!isDead.current) playAnimation('Idle');
        }, { once: true });

        window.dispatchEvent(new CustomEvent('enemyAttack', { detail: { damage: 10 } }));
      } else {
        playAnimation('Idle');
      }
    }
  });

  return (
    <group ref={groupRef} position={positionRef.current}>
      <primitive object={gltf.scene} scale={0.01} receiveShadow />
      <Html distanceFactor={8} position={[0, 1, 0]}>
        <HealthBar health={health} />
      </Html>
    </group>
  );
}
