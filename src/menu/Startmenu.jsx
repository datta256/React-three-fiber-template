import './Menu.css';

export default function StartMenu({ onStart }) {
  return (
    <div className="menu-overlay">
      <div className="menu-title">Welcome to the Game</div>
      <button className="menu-button" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
