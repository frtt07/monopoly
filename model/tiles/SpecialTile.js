export class SpecialTile extends Tile {
  constructor(id, name, type, action) {
    super(id, name, type);
    this.action = action;
  }

  // Aplica la acción: cambios económicos o de posición
  apply(player) {
    if (this.action?.money) player.updateBalance(this.action.money);
    if (this.action?.goTo === 'jail') player.goToJail(); 
  }
}