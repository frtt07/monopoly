export class SpecialTile extends Tile {
  constructor(id, name, type, action) {
    super(id, name, type);
    this.action = action;
  }

  getAction() {
    return this.action;
  }

  setAction(action) {
    if (typeof action !== 'object' || Array.isArray(action)) {
      throw new TypeError('action debe de ser de tipo object');
    }
    this.action = action;
  }

  // Aplica la acción: cambios económicos o de posición
  apply(player) {
    if (this.action?.money) player.setBalance(this.action.money);
    if (this.action?.goTo === 'jail') player.goToJail(); 
  }
}