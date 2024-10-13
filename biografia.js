document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const artistName = params.get('name');

    if (artistName) {
        console.log('Nombre del artista:', artistName);
        obtenerInfoArtista(artistName);
    } else {
        document.querySelector('.container').innerHTML = '<p>No se especificó un artista.</p>';
    }
});

/* OBTENER INFORMACIÓN DEL ARTISTA */
async function obtenerInfoArtista(nombreArtista) {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(nombreArtista)}&api_key=76f33100dd7284b4c8435ff478a8d1b0&format=json`;
        console.log('URL de la API:', url);
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        console.log('Respuesta de la API:', datos);

        if (datos.artist) {
            const infoLocal = await obtenerInfoLocal(nombreArtista);
            mostrarInfoArtista(datos.artist, infoLocal);
        } else {
            document.getElementById('artist-info').innerHTML = '<p>No se encontró información para el artista.</p>';
            console.error('Datos de la API no contienen información del artista:', datos);
        }
    } catch (error) {
        console.error('Error al obtener información del artista:', error);
        document.getElementById('artist-info').innerHTML = '<p>Error al cargar la información del artista.</p>';
    }
}

/* OBTENER INFORMACIÓN LOCAL DEL ARTISTA */
async function obtenerInfoLocal(nombreArtista) {
    try {
        const response = await fetch('vocalistas.json');
        const data = await response.json();
        return data.vocalistas.find(a => a.nombre.toLowerCase() === nombreArtista.toLowerCase());
    } catch (error) {
        console.error('Error al cargar el JSON local:', error);
        return null;
    }
}

/* MOSTRAR INFORMACIÓN DEL ARTISTA */
function mostrarInfoArtista(artistaInfo, infoLocal) {
    const containerElement = document.querySelector('.container');
    containerElement.innerHTML = '';

    if (infoLocal) {
        console.log('Información local del artista encontrada:', infoLocal);
        const fechaNacimiento = infoLocal.fechaNacimiento ? new Date(infoLocal.fechaNacimiento).toLocaleDateString() : 'Desconocida';
        const fechaFallecimiento = infoLocal.fechaFallecimiento ? new Date(infoLocal.fechaFallecimiento).toLocaleDateString() : 'Vivo';

        containerElement.innerHTML = `
            <div class="artist-info-container">
                <div class="artist-image-container">
                    <img src="${infoLocal.imagenUrl}" alt="${artistaInfo.name}" class="artist-image-bio">
                    <div class="artist-dates">
                    <h1>${artistaInfo.name}</h1>
                        <p>Nacimiento ${fechaNacimiento}</p>
                        <p>Fallecimiento ${fechaFallecimiento}</p>
                    </div>
                </div>
                <div class="artist-bio">
                    <h2>Biografía</h2>
                    <p>${artistaInfo.bio.content}</p>
                    <p>Oyentes: ${artistaInfo.stats.listeners}</p>
                    <p>Reproducciones: ${artistaInfo.stats.playcount}</p>
                </div>
            </div>
        `;
    } else {
        console.log('No se encontró información local del artista');
        containerElement.innerHTML = `
            <div class="artist-info-container">
                <div class="artist-image-container">
                    <h1>${artistaInfo.name}</h1>
                </div>
                <div class="artist-bio">
                    <h2>Biografía</h2>
                    <p>${artistaInfo.bio.content}</p>
                    <p>Oyentes: ${artistaInfo.stats.listeners}</p>
                    <p>Reproducciones: ${artistaInfo.stats.playcount}</p>
                </div>
            </div>
        `;
    }
}
