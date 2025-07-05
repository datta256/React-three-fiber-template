
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three';
import './App.css'
import Player from './Player'
import Ground from './Ground'
import Enemy from './Enemy'

function App() {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 0));
  return (
    <div className="App">
      <Canvas style={{ width: '100%', height: '100%' }}  dpr={1} frameloop="always" camera={{ position: [0, 5, 10], fov: 35 }}   gl={{ powerPreference: 'high-performance' ,  antialias: false}} >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />
<Player onMove={(pos) => setPlayerPos(pos)} />
<Enemy targetPosition={playerPos} />
      <Ground/>
   

    </Canvas>
    </div>
  )
}

export default App