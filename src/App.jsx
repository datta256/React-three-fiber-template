import { Canvas } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import './App.css';
import Player from './Player';
import Ground from './Ground';
import Enemy from './Enemy';
import PlayerHealth from './PlayerHealth';

function App() {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 0));
  const [playerHealth, setPlayerHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);

  const handleEnemyAttack = () => {
    setPlayerHealth(prev => {
      const newHealth = Math.max(prev - 10, 0);
      if (newHealth === 0 && !isDead) {
        setIsDead(true);
        console.log("Player is dead");
      } else {
        console.log("Player health:", newHealth);
      }
      return newHealth;
    });
  };

  // Optional: React to death with effects
  useEffect(() => {
    if (isDead) {
      console.log("Player is dead. Waiting for respawn...");
    }
  }, [isDead]);

  const handleRespawn = () => {
    setIsDead(false);
    setPlayerHealth(100);
    setPlayerPos(new THREE.Vector3(0, 1, 0));  // Optional: reset position
  };

  return (
    <div className="App">
      <PlayerHealth health={playerHealth} />

      {isDead && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-4xl z-50">
          <div>You Died</div>
          <button
            className="mt-4 px-4 py-2 bg-white text-black rounded"
            onClick={handleRespawn}
          >
            Respawn
          </button>
        </div>
      )}

      <Canvas
        style={{ width: '100%', height: '100%' }}
        dpr={1}
        frameloop="always"
        camera={{ position: [0, 5, 10], fov: 35 }}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} castShadow />
        <Player onMove={(pos) => setPlayerPos(pos)} isdead={isDead} />
        <Enemy targetPosition={playerPos} onAttack={handleEnemyAttack} />
        <Ground />
      </Canvas>
    </div>
  );
}

export default App;
