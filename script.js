const LASTFM_API_KEY = '76f33100dd7284b4c8435ff478a8d1b0';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

let todosLosArtistas = [];
const ARTISTAS_POR_PAGINA = 10;
let paginaActual = 1;

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

function mostrarArtistas(artistas, pagina = 1) {
    console.log('Mostrando artistas...', artistas.length); // Para depuración
    paginaActual = pagina;
    const contenedorTarjetas = document.querySelector('.artist-cards');
    const paginacionContainer = document.getElementById('pagination');
    contenedorTarjetas.innerHTML = '';
    paginacionContainer.innerHTML = '';

    const inicio = (paginaActual - 1) * ARTISTAS_POR_PAGINA;
    const fin = inicio + ARTISTAS_POR_PAGINA;
    const artistasPagina = artistas.slice(inicio, fin);

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
            <a href="biografia.html?name=${encodeURIComponent(artista.nombre)}" class="ver-mas-btn">Ver más</a>
        `;
        contenedorTarjetas.appendChild(tarjeta);
    });

    const totalPaginas = Math.ceil(artistas.length / ARTISTAS_POR_PAGINA);
    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.classList.add('pagination-btn');
        if (i === paginaActual) {
            boton.classList.add('active');
        }
        boton.addEventListener('click', () => {
            mostrarArtistas(artistas, i);
            window.scrollTo(0, 0);
        });
        paginacionContainer.appendChild(boton);
    }
}

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

function mostrarInfoAdicional(artistaInfo) {
    // Aquí puedes crear un modal o un elemento en la página para mostrar la información adicional
    console.log('Información adicional del artista:', artistaInfo);
    // Por ahora, solo mostraremos un alert con algunos datos
    alert(`
        Nombre: ${artistaInfo.name}
        Oyentes: ${artistaInfo.stats.listeners}
        Reproducciones: ${artistaInfo.stats.playcount}
        Biografía: ${artistaInfo.bio.summary}
    `);
}

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

function actualizarPaginacion(totalArtistas = todosLosArtistas.length) {
    const totalPaginas = Math.ceil(totalArtistas / ARTISTAS_POR_PAGINA);
    const paginacion = document.getElementById('pagination');
    paginacion.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.addEventListener('click', () => cambiarPagina(i));
        if (i === paginaActual) {
            boton.classList.add('active');
        }
        paginacion.appendChild(boton);
    }
}

function cambiarPagina(numeroPagina) {
    paginaActual = numeroPagina;
    const inicio = (paginaActual - 1) * ARTISTAS_POR_PAGINA;
    const fin = inicio + ARTISTAS_POR_PAGINA;
    mostrarArtistas(todosLosArtistas.slice(inicio, fin));
    actualizarPaginacion();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function mostrarMensajeCarga(mostrar) {
    const mensajeCarga = document.getElementById('loading-message');
    if (mensajeCarga) {
        mensajeCarga.style.display = mostrar ? 'block' : 'none';
    }
}

function aplicarFiltros() {
    console.log('Aplicando filtros...'); // Para depuración
    const decadaSeleccionada = document.getElementById('decadeFilter').value;
    const estadoSeleccionado = document.getElementById('statusFilter').value;
    const generoSeleccionado = document.getElementById('genreFilter').value;

    console.log('Filtros seleccionados:', { decadaSeleccionada, estadoSeleccionado, generoSeleccionado }); // Para depuración

    const artistasFiltrados = todosLosArtistas.filter(artista => {
        const cumpleDecada = decadaSeleccionada === 'all' || (artista.fechaNacimiento && new Date(artista.fechaNacimiento).getFullYear().toString().startsWith(decadaSeleccionada.slice(0, 3)));
        const cumpleEstado = estadoSeleccionado === 'all' || 
            (estadoSeleccionado === 'alive' && !artista.fechaFallecimiento) || 
            (estadoSeleccionado === 'deceased' && artista.fechaFallecimiento);
        const cumpleGenero = generoSeleccionado === 'all' || (artista.genero && artista.genero.toLowerCase().includes(generoSeleccionado.toLowerCase()));

        return cumpleDecada && cumpleEstado && cumpleGenero;
    });

    console.log('Artistas filtrados:', artistasFiltrados.length); // Para depuración
    mostrarArtistas(artistasFiltrados);
}

function cargarArtistas() {
    fetch('vocalistas.json')
        .then(response => response.json())
        .then(data => {
            todosLosArtistas = data.vocalistas;
            console.log('Artistas cargados:', todosLosArtistas.length); // Para depuración
            mostrarArtistas(todosLosArtistas);
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarArtistas();
    
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', buscarArtistas);
    
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            buscarArtistas();
        }
    });
    
    document.getElementById('filterButton').addEventListener('click', aplicarFiltros);
});
