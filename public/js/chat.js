const url = ( window.location.hostname.includes("localhost") )
            ? "http://localhost:8080/api/auth/"
            : "https://restserver-nodeapp-jeff.herokuapp.com/api/auth/";

let usuario = null; 
let socket  = null;

// Referencia HTML
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');

// Validar el token del localStorage
const validarJWT = async() => {

    const token = localStorage.getItem('token') || '';
    
    if ( token.length <= 10 ) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch( url, {
        headers: { 'x-token': token },
    });

    const { usuario: userDB, token: tokenDB, } = await resp.json();

    // RenovarToken
    localStorage.setItem('token', tokenDB);

    // Infirmacion del usuario
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();

}

const conectarSocket = async() => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Sockets online');
    })

    socket.on('disconnect', () => {
        console.log('Sockets offline');
    })

    socket.on('recibir-mensajes', dibujarMensajes );

    socket.on('usuarios-activos', dibujarUsuarios );

    socket.on('mensaje-privado', ( payload ) => {
        console.log( 'Privado:', payload );
    })

}

const dibujarUsuarios = async( usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach( ({ nombre, uid }) => {

        usersHtml += `
           <li>
               <p>
                   <h5 class="text-success">${ nombre }</h5> 
                  <span class="fs-6 text-muted">${ uid }</span> 
               </p> 
           </li> 

        `;
    });

    ulUsuarios.innerHTML = usersHtml;

}

const dibujarMensajes = async( mensajes = []) => {

    let mensajesHtml = '';
    mensajes.forEach( ({ nombre, mensaje }) => {

        mensajesHtml += `
           <li>
               <p>
                   <span class="text-primary">${ nombre }: </span> 
                  <span>${ mensaje }</span> 
               </p> 
           </li> 

        `;
    });

    ulMensajes.innerHTML = mensajesHtml;

}

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    let mensajes = txtMensaje.value;
    mensaje   = mensajes.trim();
    const uid = txtUid.value;

    if( keyCode !== 13 ){ return; };
    if( mensaje.length === 0 ){ return; };   

    socket.emit('enviar-mensaje', { mensaje, uid } );

    txtMensaje.value = '';

});

const main = async() => {

    // ValidarJWT
    await validarJWT(); 
}


main();


