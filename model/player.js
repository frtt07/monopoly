export class Player {
  constructor(
    id,
    nickname,
    country,
    balance = 1500,
    position = 0,
    properties = [],
    inJail = false,
    jailTurns = 0,
    background = "",
    mortgagedProperties = []
  ) {
    // Validación que sea un array
    if (!Array.isArray(properties)) {
      throw new TypeError(
        "properties debe ser un array de números (ids de casilla)"
      );
    }

    if (typeof nickname !== "string" || nickname.trim() === "") {
      throw new TypeError("nickname debe de ser de tipo string");
    }

    this.id = id;
    this.nickname = nickname;
    this.country = country;
    this.balance = balance;
    this.position = position;
    this.properties = properties; // array de ids
    this.mortgagedProperties = mortgagedProperties; // array de ids hipotecados
    this.inJail = inJail;
    this.jailTurns = jailTurns;
    this.background = background;
  }

  // -------- Getters --------
  getId() {
    return this.id;
  }
  getNickname() {
    return this.nickname;
  }
  getCountry() {
    return this.country;
  }
  getBalance() {
    return this.balance;
  }
  getPosition() {
    return this.position;
  }
  getProperties() {
    return this.properties;
  }
  getInJail() {
    return this.inJail;
  }
  getJailTurns() {
    return this.jailTurns;
  }
  getBackground() {
    return this.background;
  }

  // -------- Setters --------
  setposition(newPosition) {
    if (typeof newPosition !== "number" || newPosition < 0) {
      throw new TypeError("newPosition debe de ser de tipo number");
    }
    this.position = newPosition;
  }

  setInJail(status) {
    if (typeof status !== "boolean") {
      throw new TypeError("status debe de ser de tipo boolean");
    }
    this.inJail = status;
  }

  setBalance(amount) {
    this.balance = amount;
  }

  // -------- Propiedades --------
  addProperty(propertyId) {
    if (typeof propertyId !== "number") {
      throw new TypeError("propertyId debe ser un número");
    }
    if (!this.properties.includes(propertyId)) {
      this.properties.push(propertyId);
    }
  }

  removeProperty(propertyId) {
    const index = this.properties.indexOf(propertyId);
    if (index !== -1) {
      this.properties.splice(index, 1);
    } else {
      throw new Error(`No se encontró la propiedad con id: ${propertyId}`);
    }
  }

  tieneProperty(posicion) {
    return this.properties.includes(posicion);
  }

  // -------- Serialización --------
  PlayertoJSON() {
    return {
      nickname: this.nickname,
      country: this.country,
      balance: this.balance,
      position: this.position,
      properties: this.properties, // array de ids
      mortgagedProperties: this.mortgagedProperties, // array de ids hipotecados
      inJail: this.inJail,
      jailTurns: this.jailTurns,
      background: this.background,
    };
  }

  // -------- Acciones --------
  buyProperty(casillaId, precio, casillaElement) {
    if (typeof casillaId !== "number") {
      throw new TypeError("casillaId debe ser un número");
    }
    if (typeof precio !== "number" || precio <= 0) {
      throw new TypeError("precio debe ser un número válido");
    }

    if (this.balance >= precio) {
      this.setBalance(this.getBalance() - precio);

      // Registrar propiedad
      this.addProperty(casillaId);

      // Cambiar color de la casilla al color del jugador
      if (casillaElement) {
        let colorBox = casillaElement.querySelector(".casilla-color");
        if (colorBox) {
          colorBox.style.backgroundColor = this.getBackground();
        }
      }
    } else {
      throw new Error("Fondos insuficientes para comprar la propiedad");
    }
  }

  goToJail() {
    this.setposition(10); // posición de la cárcel
    this.setInJail(true);
    this.jailTurns = 0;
  }

  // Método para pagar renta a otro jugador
  payRent(amount, owner) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new TypeError("amount debe ser un número positivo");
    }

    if (!(owner instanceof Player)) {
      throw new TypeError("owner debe ser una instancia de Player");
    }

    if (this.balance < amount) {
      throw new Error(
        `Fondos insuficientes. Balance actual: $${this.balance}, Renta requerida: $${amount}`
      );
    }

    // Realizar la transferencia
    this.setBalance(this.getBalance() - amount);
    owner.setBalance(owner.getBalance() + amount);

    return {
      success: true,
      message: `${this.nickname} pagó $${amount} a ${owner.nickname}`,
      payerBalance: this.balance,
      ownerBalance: owner.balance,
    };
  }

  // -------- Métodos para hipotecas --------

  /**
   * Hipoteca una propiedad para obtener liquidez
   * @param {number} propertyId - ID de la propiedad a hipotecar
   * @param {number} mortgageValue - Valor de la hipoteca
   * @returns {boolean} - true si se hipotecó exitosamente
   */
  mortgageProperty(propertyId, mortgageValue) {
    // Verificar que el jugador tiene la propiedad
    if (!this.tieneProperty(propertyId)) {
      throw new Error("No puedes hipotecar una propiedad que no posees");
    }

    // Verificar que la propiedad no esté ya hipotecada
    if (this.mortgagedProperties.includes(propertyId)) {
      throw new Error("Esta propiedad ya está hipotecada");
    }

    // Agregar a propiedades hipotecadas
    this.mortgagedProperties.push(propertyId);

    // Agregar el dinero al balance
    this.setBalance(this.getBalance() + mortgageValue);

    return true;
  }

  /**
   * Deshipoteca una propiedad pagando el valor + 10% de interés
   * @param {number} propertyId - ID de la propiedad a deshipotecar
   * @param {number} mortgageValue - Valor original de la hipoteca
   * @returns {boolean} - true si se deshipotecó exitosamente
   */
  unmortgageProperty(propertyId, mortgageValue) {
    // Verificar que la propiedad está hipotecada
    if (!this.mortgagedProperties.includes(propertyId)) {
      throw new Error("Esta propiedad no está hipotecada");
    }

    // Calcular el costo total (valor + 10% de interés)
    const totalCost = Math.ceil(mortgageValue * 1.1);

    // Verificar que el jugador tiene fondos suficientes
    if (this.getBalance() < totalCost) {
      throw new Error(
        `Fondos insuficientes. Necesitas $${totalCost} para deshipotecar esta propiedad`
      );
    }

    // Remover de propiedades hipotecadas
    const index = this.mortgagedProperties.indexOf(propertyId);
    this.mortgagedProperties.splice(index, 1);

    // Deducir el costo del balance
    this.setBalance(this.getBalance() - totalCost);

    return true;
  }

  /**
   * Verifica si una propiedad está hipotecada
   * @param {number} propertyId - ID de la propiedad
   * @returns {boolean} - true si está hipotecada
   */
  isPropertyMortgaged(propertyId) {
    return this.mortgagedProperties.includes(propertyId);
  }

  /**
   * Obtiene todas las propiedades hipotecadas
   * @returns {Array} - Array de IDs de propiedades hipotecadas
   */
  getMortgagedProperties() {
    return [...this.mortgagedProperties];
  }

  /**
   * Obtiene todas las propiedades NO hipotecadas
   * @returns {Array} - Array de IDs de propiedades no hipotecadas
   */
  getUnmortgagedProperties() {
    return this.properties.filter(
      (propId) => !this.mortgagedProperties.includes(propId)
    );
  }
}

export default Player;