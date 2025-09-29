// Función para mostrar diferentes secciones (solo para index.html)
function mostrarSeccion(seccion) {
  // Solo funciona si los elementos existen (en index.html)
  const inicioElement = document.getElementById("seccion-inicio");
  const rankingElement = document.getElementById("seccion-ranking");

  if (inicioElement && rankingElement) {
    // Ocultar todas las secciones
    inicioElement.style.display = "none";
    rankingElement.style.display = "none";

    // Mostrar la sección seleccionada
    document.getElementById("seccion-" + seccion).style.display = "block";

    // Si es la sección de ranking, cargar ranking
    if (seccion === "ranking") {
      cargarRanking();
    }
  }
}

// Verificar si la URL contiene #ranking (solo para index.html)
window.addEventListener("load", function () {
  if (window.location.hash === "#ranking") {
    mostrarSeccion("ranking");
  }

  // Si estamos en ranking.html, cargar automáticamente
  if (window.location.pathname.includes("ranking.html")) {
    cargarRanking();
  }
});

// Función para cargar el ranking
async function cargarRanking() {
  const loadingElement = document.getElementById("loading-ranking");
  const containerElement = document.getElementById("ranking-container");
  const btnElement = document.getElementById("btnCargarRanking");

  loadingElement.style.display = "block";
  btnElement.disabled = true;
  containerElement.innerHTML = "";

  try {
    const response = await fetch("http://127.0.0.1:5000/ranking");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const ranking = await response.json();
    mostrarRanking(ranking);
  } catch (error) {
    console.error("Error cargando ranking:", error);
    containerElement.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error al cargar el ranking</h4>
        <p>No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://127.0.0.1</p>
        <p class="mb-0"><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  } finally {
    loadingElement.style.display = "none";
    btnElement.disabled = false;
  }
}

// Función para mostrar el ranking
function mostrarRanking(ranking) {
  const container = document.getElementById("ranking-container");

  if (!ranking || ranking.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        <h4 class="alert-heading">Sin datos</h4>
        <p class="mb-0">No hay puntuaciones registradas todavía. ¡Juega algunas partidas primero!</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="card mb-5">
      <div class="card-header">
        <h3 class="card-title mb-0">Top Jugadores</h3>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-striped mb-0">
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">País</th>
                <th scope="col">Jugador</th>
                <th scope="col">Puntuación</th>
              </tr>
            </thead>
            <tbody>
  `;

  ranking.forEach((jugador, index) => {
    const flagUrl = `https://flagsapi.com/${jugador.country_code.toUpperCase()}/flat/32.png`;

    html += `
      <tr>
        <td>
          <span class="fw-bold">${index + 1}</span>
        </td>
        <td>
          <img src="${flagUrl}" alt="${jugador.country_code}" class="me-2" 
               style="width: 32px; height: auto;" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjI0IiBmaWxsPSIjQ0NDIi8+CjwvZHN2Zz4='; this.title='Bandera no disponible'">
          ${jugador.country_code.toUpperCase()}
        </td>
        <td>
          <strong>${jugador.nick_name}</strong>
        </td>
        <td>
          <span class="badge bg-success fs-6">$${jugador.score.toLocaleString()}</span>
        </td>
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Event listener para el botón de cargar ranking
document.addEventListener("DOMContentLoaded", function () {
  const btnCargarRanking = document.getElementById("btnCargarRanking");
  if (btnCargarRanking) {
    btnCargarRanking.addEventListener("click", cargarRanking);
  }
});