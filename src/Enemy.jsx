import { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import collisionManager from './CollisonManger';
import { Html } from '@react-three/drei';
import HealthBar from './HealthBar';
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
  const currentAction = useRef(null);

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

useEffect(() => {
  const id = `enemy-${Math.random()}`;
  collisionManager.register(id, positionRef.current);

  const updatePos = () => {
    collisionManager.update(id, positionRef.current);
  };
  const interval = setInterval(updatePos, 100);  // Update every 100ms

  return () => {
    clearInterval(interval);
    collisionManager.unregister(id);
  };
}, []);



  const handleAttack = (e) => {
    if (isDead.current || isBeingHit.current) return;

    const { position: playerPos, forward: playerForward } = e.detail;
    const dist = playerPos.distanceTo(positionRef.current);

    const enemyDirection = new THREE.Vector3().subVectors(playerPos, positionRef.current).normalize();
    const facingDot = playerForward.dot(enemyDirection);
    
    if (dist < 1.5 && facingDot > 0.5 && Date.now() - lastHit.current > 800) {
      lastHit.current = Date.now();
      isBeingHit.current = true;

      setHealth(prev => {
        const newHealth = Math.max(prev - 10, 0);

        if (newHealth === 0) {
          isDead.current = true;
          playAnimation('die', true);
        } else {
          playAnimation('hit', true);
          actions['hit']?.getMixer().addEventListener('finished', () => {
            if (!isDead.current) {
              playAnimation('Idle');
              isBeingHit.current = false;
            }
          }, { once: true });
        }

        return newHealth;
      });
    }
  };

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.copy(positionRef.current);
    }

    isDead.current = false;
    isBeingHit.current = false;
    setHealth(100);

    const waitForAnimations = () => {
      if (actions['Idle']) {   // ✅ Use correct lowercase name
        playAnimation('Idle');
      } else {
        requestAnimationFrame(waitForAnimations);
      }
    };

    waitForAnimations();

    window.addEventListener('playerAttack', handleAttack);
    return () => window.removeEventListener('playerAttack', handleAttack);
  }, [actions]);

  return (
    <>

<group ref={modelRef}>
  <primitive object={gltf.scene} scale={0.01} receiveShadow />
  <Html distanceFactor={8} position={[0, 1, 0]}>
    <HealthBar health={health} />
  </Html>
</group>

   
           </>
  );
}

