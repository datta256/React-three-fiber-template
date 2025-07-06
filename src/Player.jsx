import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useMemo, useState } from 'react';
import collisionManager from './CollisonManger';
import * as THREE from 'three';

export default function Player(props) {
  const { camera } = useThree();
  const gltf = useGLTF('/walkk.glb');
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const isPerformingAction = useRef(false);
  const modelRef = useRef();
  const position = useRef(new THREE.Vector3(0, 1, 0));
  const direction = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = 0.1;

  const keys = useRef({ w: false, a: false, s: false, d: false });
  const currentAction = useRef(null);
  const cameraOffset = useMemo(() => new THREE.Vector3(5, 5, 5), []);

  const [hasDied, setHasDied] = useState(false);   // ✅ Local state to prevent multiple triggers

  const keyDown = (e) => {
    if (props.isdead || hasDied) return;           // ✅ Stop keys if dead
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) keys.current[k] = true;
    if (!isPerformingAction.current) {
      if (k === 'j') triggerAction('Punch');
      if (k === 'k') triggerAction('kick');
      if (k === ' ') triggerAction('jump');
    }
  };

  const keyUp = (e) => {
    if (props.isdead || hasDied) return;           // ✅ Stop keyup too
    const k = e.key.toLowerCase();
    if (keys.current.hasOwnProperty(k)) keys.current[k] = false;
  };

  const triggerAction = (actionName) => {
    if (!actions[actionName] || props.isdead || hasDied) return;  // ✅ Block actions if dead
    isPerformingAction.current = true;
    playAnimation(actionName);
    actions[actionName].clampWhenFinished = true;
    actions[actionName].setLoop(THREE.LoopOnce);
    actions[actionName].reset().fadeIn(0.1).play();
    actions[actionName].getMixer().addEventListener('finished', () => {
      isPerformingAction.current = false;
      const moveX = (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0);
      const moveZ = (keys.current.s ? 1 : 0) - (keys.current.w ? 1 : 0);
      const moving = moveX !== 0 || moveZ !== 0;
      playAnimation(moving ? 'sprint' : 'Idle');
    }, { once: true });
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    actions.Idle?.reset().fadeIn(1).play();
    currentAction.current = 'Idle';
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [actions]);

  const playAnimation = (name) => {
    if (currentAction.current !== name) {
      actions[currentAction.current]?.fadeOut(0.2);
      actions[name]?.reset().fadeIn(0.5).play();
      currentAction.current = name;
    }

  };

useEffect(() => {
  if (!props.isdead) {
    setHasDied(false);                   // ✅ Reset local death state
    playAnimation('Idle');                // ✅ Reset animation to Idle
    if (modelRef.current) {
      modelRef.current.position.copy(position.current);
    }
  }
}, [props.isdead]);



  useFrame(() => {
    if (props.isdead && !hasDied) {               // ✅ Only trigger once when dead
      setHasDied(true);
      playAnimation('die');
      return;
    }

    if (props.isdead || hasDied) return; 
    
     // ✅ Send position to parent every frame:
  if (props.onMove) {
    props.onMove(position.current.clone());
  }// ✅ Block everything else when dead

    const moveX = (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0);
    const moveZ = (keys.current.s ? 1 : 0) - (keys.current.w ? 1 : 0);
    const isMoving = moveX !== 0 || moveZ !== 0;

    if (!isPerformingAction.current) {
      playAnimation(isMoving ? 'sprint' : 'idle');
    }

    if (isMoving && !isPerformingAction.current) {
      direction.current.set(moveX, 0, moveZ).normalize();
      const nextPosition = position.current.clone().add(direction.current.clone().multiplyScalar(velocity));
      const collides = collisionManager.isColliding(nextPosition, 0.5);
      if (!collides) {
        position.current.copy(nextPosition);
        if (modelRef.current) {
          modelRef.current.rotation.y = Math.atan2(direction.current.x, direction.current.z);
        }
      }
    }

    if (modelRef.current) {
      modelRef.current.position.copy(position.current).add(new THREE.Vector3(0, 0.05, 0));
    }

    const targetCamPos = position.current.clone().add(cameraOffset);
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(position.current);
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      scale={0.01}
      receiveShadow
    />
  );
}
