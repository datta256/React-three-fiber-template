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
  const [enemyPositions, setEnemyPositions] = useState({});  // id: position

// Update enemyPositions each frame from each Enemy
const updateEnemyPosition = (id, pos) => {
  setEnemyPositions(prev => ({ ...prev, [id]: pos.clone() }));
};


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
  const numEnemies = 2 + waveNumber;
  const radius = 5 + waveNumber * 1.5;  // Increase radius with each wave

  const newEnemies = Array.from({ length: numEnemies }, (_, index) => {
    const angle = (index / numEnemies) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return {
      id: `${waveNumber}-${index}-${Date.now()}`,
      position: new THREE.Vector3(x, 1, z)
    };
  });

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
                updatePosition={(pos) => updateEnemyPosition(enemy.id, pos)}
                allEnemyPositions={enemies.map(e => e.position)}
                onAttack={handleEnemyAttack}
                ondeath={() => handleEnemyDeath(enemy.id)}
              />
            ))}
          </>
        )}
      </Canvas>
    </div>
  );
}

export default App;
