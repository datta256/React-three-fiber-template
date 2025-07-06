export default function PlayerHealth({ health }) {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      background: '#222',
      padding: '8px 12px',
      borderRadius: '6px',
      color: 'white',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    }}>
      ❤️ Player Health: {health}
    </div>
  );
}


