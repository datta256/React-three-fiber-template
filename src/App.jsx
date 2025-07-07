import { Canvas } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import './App.css';
import './menu/Menu.css';
import Player from './Player';
import Enemy from './Enemy';
import PlayerHealth from './PlayerHealth';
import StartMenu from './menu/Startmenu';
import EndMenu from './menu/Endmenu';


function App() {
  const [gameState, setGameState] = useState('start');
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 0));
  const [playerHealth, setPlayerHealth] = useState(100);

  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState([]);


  const startGame = () => {
    setPlayerHealth(100);
    setPlayerPos(new THREE.Vector3(0, 1, 0));
    setWave(1);
    spawnWave(1);
    setGameState('playing');
  };

  const handleEnemyAttack = () => {
    setPlayerHealth(prev => {
      const newHealth = Math.max(prev - 10, 0);
      if (newHealth === 0 && gameState !== 'end') {
        setGameState('end');
      }
      return newHealth;
    });
  };

  const handleEnemyDeath = (id) => {
    setEnemies(prev => prev.filter(enemy => enemy.id !== id));
  };

  const spawnWave = (waveNumber) => {
    const numEnemies = 2 + waveNumber;  // For example: Wave 1 = 3, Wave 2 = 4, etc.
    const newEnemies = Array.from({ length: numEnemies }, (_, index) => ({
      id: `${waveNumber}-${index}-${Date.now()}`,
      position: new THREE.Vector3(
        Math.random() * 10 - 5, 
        1, 
        Math.random() * 10 - 5
      )
    }));
    setEnemies(newEnemies);
  };

  const handleRespawn = () => {
    setPlayerHealth(100);
    setPlayerPos(new THREE.Vector3(0, 1, 0));
    setWave(1);
    spawnWave(1);
    setGameState('playing');
  };

  // Monitor for wave clear
  useEffect(() => {
    if (gameState === 'playing' && enemies.length === 0 && playerHealth > 0) {
      const nextWave = wave + 1;
      setWave(nextWave);
      spawnWave(nextWave);
    }
  }, [enemies, gameState]);

  return (
    <div className="App">
      {gameState === 'start' && <StartMenu onStart={startGame} />}
      {gameState === 'end' && <EndMenu onRespawn={handleRespawn} />}
      {gameState === 'playing' && <PlayerHealth health={playerHealth} />}

      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 text-white text-xl font-bold z-10">
          Wave: {wave}
        </div>
      )}

      <Canvas
        style={{ width: '100%', height: '100%' }}
        dpr={1}
        frameloop="always"
        camera={{ position: [0, 5, 10], fov: 70 }}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} castShadow />

        {gameState === 'playing' && (
          <>
            <Player onMove={(pos) => setPlayerPos(pos)} isdead={gameState === 'end'} />
            
            {enemies.map(enemy => (
              <Enemy
                key={enemy.id}
                id={enemy.id}
                position={enemy.position}
                targetPosition={playerPos}
                onAttack={handleEnemyAttack}
                onDeath={() => handleEnemyDeath(enemy.id)}
              />
            ))}
          </>
        )}
      </Canvas>
    </div>
  );
}

export default App;
