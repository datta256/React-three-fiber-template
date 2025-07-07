import './Menu.css';

export default function EndMenu({ onRespawn }) {
  return (
    <div className="menu-overlay">
      <div className="menu-title">You Died</div>
      <button className="menu-button" onClick={onRespawn}>
        Respawn
      </button>
    </div>
  );
}
