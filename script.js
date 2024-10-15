const LASTFM_API_KEY = '76f33100dd7284b4c8435ff478a8d1b0';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

/* VARIABLES */
let todosLosArtistas = [];
const ARTISTAS_POR_PAGINA = 12;
let paginaActual = 1;

let artistasFiltrados = [];


/* OBTENER ARTISTAS */
async function obtenerArtistas() {
    try {
        mostrarMensajeCarga(true);
        console.log('Iniciando obtenerArtistas');

        const respuesta = await fetch('vocalistas.json');
        const datos = await respuesta.json();
        todosLosArtistas = datos.vocalistas;

        console.log('Mostrando artistas');
        mostrarArtistas(todosLosArtistas.slice(0, ARTISTAS_POR_PAGINA));
        actualizarPaginacion();
    } catch (error) {
        console.error('Error al obtener los artistas:', error);
    } finally {
        mostrarMensajeCarga(false);
    }
}


/* MOSTRAR ARTISTAS */
function mostrarArtistas() {
    const inicio = (paginaActual - 1) * ARTISTAS_POR_PAGINA;
    const fin = inicio + ARTISTAS_POR_PAGINA;
    const artistasPagina = artistasFiltrados.slice(inicio, fin);

    const contenedorTarjetas = document.querySelector('.artist-cards');
    contenedorTarjetas.innerHTML = '';

    artistasPagina.forEach(artista => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'artist-card';
        
        const fechaNacimiento = artista.fechaNacimiento ? new Date(artista.fechaNacimiento).toLocaleDateString() : 'Desconocida';
        const fechaFallecimiento = artista.fechaFallecimiento ? new Date(artista.fechaFallecimiento).toLocaleDateString() : 'Vivo';
        
        tarjeta.innerHTML = `
            <img src="${artista.imagenUrl}" alt="${artista.nombre}" class="artist-image" loading="lazy">
            <h2 class="artist-name">${artista.nombre}</h2>
            <p>Nacimiento: ${fechaNacimiento}</p>
            <p>Fallecimiento: ${fechaFallecimiento}</p>
            <p>Género: ${artista.genero || 'No especificado'}</p>
            <a href="biografia.html?name=${encodeURIComponent(artista.nombre)}" class="ver-mas-btn">Biografía</a>
        `;
        contenedorTarjetas.appendChild(tarjeta);
    });

    /* PAGINACIÓN */
    const totalPaginas = Math.ceil(artistasFiltrados.length / ARTISTAS_POR_PAGINA);
    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.classList.add('pagination-btn');
        if (i === paginaActual) {
            boton.classList.add('active');
        }
        boton.addEventListener('click', () => {
            mostrarArtistas();
            window.scrollTo(0, 0);
        });
        const paginacionContainer = document.getElementById('pagination');
        paginacionContainer.appendChild(boton);
    }
}

/* OBTENER INFORMACIÓN ADICIONAL DEL ARTISTA */
async function obtenerInfoAdicional(nombreArtista) {
    try {
        const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(nombreArtista)}&api_key=TU_API_KEY&format=json`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.artist) {
            mostrarInfoAdicional(datos.artist);
        } else {
            console.error('No se encontró información para el artista:', nombreArtista);
        }
    } catch (error) {
        console.error('Error al obtener información adicional:', error);
    }
}


/* MOSTRAR INFORMACIÓN ADICIONAL DEL ARTISTA */
function mostrarInfoAdicional(artistaInfo) {
    
    console.log('Información adicional del artista:', artistaInfo);
    
    alert(`
        Nombre: ${artistaInfo.name}
        Oyentes: ${artistaInfo.stats.listeners}
        Reproducciones: ${artistaInfo.stats.playcount}
        Biografía: ${artistaInfo.bio.summary}
    `);
}


/* BUSCADOR */
function buscarArtistas() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();
    
    const artistasFiltrados = todosLosArtistas.filter(artista => 
        artista.nombre.toLowerCase().includes(searchTerm)
    );
    
    paginaActual = 1;
    mostrarArtistas(artistasFiltrados.slice(0, ARTISTAS_POR_PAGINA));
    actualizarPaginacion(artistasFiltrados.length);
}


/* ACTUALIZAR PAGINACIÓN */
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(artistasFiltrados.length / ARTISTAS_POR_PAGINA);
    const paginacion = document.getElementById('pagination');
    paginacion.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.classList.add('pagination-btn');
        if (i === paginaActual) {
            boton.classList.add('active');
        }
        boton.addEventListener('click', () => cambiarPagina(i));
        paginacion.appendChild(boton);
    }
}


/* CAMBIAR DE PÁGINA */
function cambiarPagina(numeroPagina) {
    paginaActual = numeroPagina;
    mostrarArtistas();
    actualizarPaginacion();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


/* FILTROS */
function aplicarFiltros() {
    const estadoSeleccionado = document.getElementById('statusFilter').value;
    const generoSeleccionado = document.getElementById('genreFilter').value;
    const busqueda = document.getElementById('searchInput').value.toLowerCase();

    artistasFiltrados = todosLosArtistas.filter(artista => {
        const cumpleEstado = estadoSeleccionado === 'all' || 
            (estadoSeleccionado === 'alive' && !artista.fechaFallecimiento) || 
            (estadoSeleccionado === 'deceased' && artista.fechaFallecimiento);
        
        const cumpleGenero = generoSeleccionado === 'all' || 
            (artista.genero && artista.genero.toLowerCase().includes(generoSeleccionado.toLowerCase()));
        
        const cumpleBusqueda = busqueda === '' || 
            artista.nombre.toLowerCase().includes(busqueda);

        return cumpleEstado && cumpleGenero && cumpleBusqueda;
    });

    paginaActual = 1;
    mostrarArtistas();
    actualizarPaginacion();
}


/* CARGAR ARTISTAS */
function cargarArtistas() {
    fetch('vocalistas.json')
        .then(response => response.json())
        .then(data => {
            todosLosArtistas = data.vocalistas;
            artistasFiltrados = todosLosArtistas;
            mostrarArtistas();
            actualizarPaginacion();
        })
        .catch(error => console.error('Error:', error));
}

function verBiografia(nombre) {
    window.location.href = `biografia.html?nombre=${encodeURIComponent(nombre)}`;
}


/* MOSTRAR BIOGRAFÍA */
function mostrarBiografia(artista) {
    const contenedorPrincipal = document.querySelector('.container');
    contenedorPrincipal.innerHTML = `
        <div class="biografia">
            <div class="biografia-izquierda">
                <img src="${artista.imagenUrl}" alt="${artista.nombre}">
                <h2>${artista.nombre}</h2>
                <p>Nacimiento: ${artista.fechaNacimiento}</p>
                ${artista.fechaFallecimiento ? `<p>Fallecimiento: ${artista.fechaFallecimiento}</p>` : ''}
                <p>Género: ${artista.genero}</p>
            </div>
            <div class="biografia-derecha">
                <h3>Biografía</h3>
                <p>${artista.biografia || 'Biografía no disponible.'}</p>
            </div>
        </div>
        
    `;

}


/* CREAR BOTONES DE PAGINACIÓN */
function crearBotonesPaginacion(totalPaginas) {
    const paginacion = document.getElementById('pagination');
    paginacion.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.textContent = i;
        boton.classList.add('pagination-btn');
        if (i === paginaActual) {
            boton.classList.add('active');
        }
        boton.addEventListener('click', () => {
            paginaActual = i;
            aplicarFiltros();
            actualizarBotonesPaginacion();
        });
        paginacion.appendChild(boton);
    }
}

function actualizarBotonesPaginacion() {
    const botones = document.querySelectorAll('.pagination-btn');
    botones.forEach((boton, index) => {
        if (index + 1 === paginaActual) {
            boton.classList.add('active');
        } else {
            boton.classList.remove('active');
        }
    });
}


/* EVENTOS */
document.addEventListener('DOMContentLoaded', () => {
    cargarArtistas();
    
    document.getElementById('filterButton').addEventListener('click', aplicarFiltros);
    document.getElementById('searchButton').addEventListener('click', aplicarFiltros);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });

    // Llamada inicial para mostrar todos los artistas y crear la paginación
    aplicarFiltros();
});
