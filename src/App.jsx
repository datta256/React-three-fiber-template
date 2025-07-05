
import { Canvas } from '@react-three/fiber'
import './App.css'
import Player from './Player'
import Ground from './Ground'

function App() {
  return (
    <div className="App">
      <Canvas style={{ width: '100%', height: '100%' }}  dpr={1} frameloop="always" camera={{ position: [0, 5, 10], fov: 35 }}   gl={{ powerPreference: 'high-performance' ,  antialias: false}} >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />
    <Player />
      <Ground/>
   

    </Canvas>
    </div>
  )
}

export default App