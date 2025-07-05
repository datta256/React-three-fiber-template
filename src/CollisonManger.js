class CollisionManager {
  constructor() {
    this.entities = new Map(); // { id: THREE.Vector3 }
  }

  register(id, position) {
    this.entities.set(id, position.clone());
  }

  unregister(id) {
    this.entities.delete(id);
  }

  update(id, position) {
    this.entities.set(id, position.clone());
  }

isColliding(position, threshold = 1, selfId = null) {
  for (let [id, entityPos] of this.entities.entries()) {
    if (id === selfId) continue;  // ✅ Skip checking against self
    if (position.distanceTo(entityPos) < threshold) {
      return true;
    }
  }
  return false;
}

}

const collisionManager = new CollisionManager();
export default collisionManager;
