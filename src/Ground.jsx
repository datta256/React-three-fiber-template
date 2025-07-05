export default function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to be flat horizontally
      position={[0, -0.5, 0]} // Slightly below the player’s feet
      receiveShadow
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial />
    </mesh>
  );
}
