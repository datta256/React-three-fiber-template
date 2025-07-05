export default function HealthBar({ health }) {
  const barWidth = `${health}%`;
  const barColor = health > 50 ? 'limegreen' : health > 20 ? 'orange' : 'red';

  return (
    <div style={{
      width: '50px',
      height: '8px',
      border: '1px solid #333',
      background: '#555',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%',
        width: barWidth,
        background: barColor,
        transition: 'width 0.2s ease'
      }} />
    </div>
  );
}
