/**--------EXPLICACION DE EXPRESIONES REGULARES---------

* Una expresión regular es una regla que define cómo debe estar escrito un dato.
Si el usuario no cumple esa regla, el formulario no se puede enviar
los patrones se guardan el unas variables y luego estas se comparan con el texto de los
imputs.
---------------MANEJO DE BLOQUEO-------------------
El código:

Bloquea al usuario en la base de datos local

Guarda ese estado en localStorage

Muestra mensaje de bloqueo

Desactiva el botón

Desactiva el campo contraseña

Muestra un error visible

--------------VALIDACION DE CONTRASEÑA-----------

la contraseña se valida cuando el input coordina con el patron  de las 
expresiones regulares en la variable regexContraseña

-----------------RECUPERACION DE CONTRASEÑA--------------------------

1. Cuando el usuario hace clic en el botón de “Recuperar contraseña”:
   - Se evita el comportamiento por defecto del botón (e.preventDefault()).
   - Se cierra el modal de login y se abre el modal de recuperación.
   - Si el usuario ya había escrito un correo, este se prellena en el formulario de recuperación.

2. Validaciones en tiempo real:
   - El campo de correo verifica que no esté vacío, que tenga un formato válido (regex) 
     y que exista en la base de usuarios.
   - La nueva contraseña se valida para que cumpla requisitos de seguridad: mínimo 6 caracteres,
     incluir mayúsculas, minúsculas, números y caracteres especiales.
   - La confirmación de contraseña comprueba que no esté vacía y coincida con la nueva contraseña.

3. Gestión de errores:
   - Se usan funciones como mostrarError() para mostrar mensajes de error cuando el campo
     no cumple los requisitos.
   - Se ocultan los errores con ocultarError() cuando la entrada es correcta.
*/

 

const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const regexCelular = /^[0-9]{7,12}$/;


// Base de datos simulada de usuarios (en localStorage)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let intentosFallidos = {};


// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {

    // ==================== ELEMENTOS DEL DOM ====================

    //Textos
    const bienvenido = document.getElementById('bienvenido');

    // Modales
    const modalRegistro = document.getElementById('modalRegistro');
    const modalLogin = document.getElementById('modalLogin');
    const modalAdvertencia = document.getElementById('modalAdvertencia');
    const modalRecuperar = document.getElementById('modalRecuperar');

    // Botones nav
    const btnCrearCuenta = document.getElementById('btnCrearCuenta');
    const btnIniciarSesion = document.getElementById('btnIniciarSesion');

    // Botones cerrar
    const btnCerrarRegistro = document.getElementById('closeModalRegistro');
    const btnCerrarLogin = document.getElementById('closeModalLogin');
    const btnCrearCuentaLogin = document.getElementById('btnCrearCuentaLogin');

    const btnCerrarAdvertencia = document.getElementById('btnCerrarAdvertencia');
    const btnCerrarRecuperar = document.getElementById('closeModalRecuperar');

    // Formularios
    const formRegistro = document.getElementById('formRegistro');
    const formLogin = document.getElementById('formLogin');
    const formRecuperar = document.getElementById('formRecuperar');

    // ==================== CAMPOS REGISTRO ====================
    const inputNombre = document.getElementById('nombreCompleto');
    const inputCorreo = document.getElementById('correo');
    const inputCelular = document.getElementById('celular');
    const inputContrasena = document.getElementById('contrasena');

    const errorNombre = document.getElementById('errorNombre');
    const errorCorreo = document.getElementById('errorCorreo');
    const errorCelular = document.getElementById('errorCelular');
    const errorContrasena = document.getElementById('errorContrasena');

    // ==================== CAMPOS LOGIN ====================
    const inputLoginCorreo = document.getElementById('loginCorreo');
    const inputLoginContrasena = document.getElementById('loginContrasena');
    const errorLoginCorreo = document.getElementById('errorLoginCorreo');
    const errorLoginContrasena = document.getElementById('errorLoginContrasena');
    const mensajeBloqueo = document.getElementById('mensajeBloqueo');
    const btnLogin = document.getElementById('btnLogin');
    const btnRecuperarContrasena = document.getElementById('btnRecuperarContrasena');

    // Deshabilitar el campo de contraseña inicialmente
    inputLoginContrasena.disabled = true;
    inputLoginContrasena.style.backgroundColor = '#f0f0f0';
    inputLoginContrasena.style.cursor = 'not-allowed';

    // ==================== CAMPOS RECUPERAR ====================
    const inputRecuperarCorreo = document.getElementById('recuperarCorreo');
    const inputNuevaContrasena = document.getElementById('nuevaContrasena');
    const inputConfirmarContrasena = document.getElementById('confirmarContrasena');
    const errorRecuperarCorreo = document.getElementById('errorRecuperarCorreo');
    const errorNuevaContrasena = document.getElementById('errorNuevaContrasena');
    const errorConfirmarContrasena = document.getElementById('errorConfirmarContrasena');

    // ==================== TOGGLE PASSWORD (MOSTRAR/OCULTAR) ====================
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const inputPassword = document.getElementById(targetId);

            if (inputPassword.type === 'password') {
                inputPassword.type = 'text';
                this.textContent = '🙈';
            } else {
                inputPassword.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // ==================== ABRIR MODALES ====================

    // Abrir modal de registro
    btnCrearCuenta.addEventListener('click', function (e) {
        e.preventDefault();
        modalRegistro.classList.add('active');
    });

    // Abrir modal de login
    btnIniciarSesion.addEventListener('click', function (e) {
        e.preventDefault();

        // Verificar si hay usuarios registrados
        if (usuarios.length === 0) {
            modalAdvertencia.classList.add('active');
            return;
        }

        modalLogin.classList.add('active');
    });

    // ==================== CERRAR MODALES ====================

    btnCerrarRegistro.addEventListener('click', function () {
        modalRegistro.classList.remove('active');
        limpiarFormularioRegistro();
    });

    btnCerrarLogin.addEventListener('click', function () {
        modalLogin.classList.remove('active');
        limpiarFormularioLogin();
    });
    btnCrearCuentaLogin.addEventListener('click',function(e){
        modalLogin.classList.remove('active');
        limpiarFormularioLogin();
        e.preventDefault();
        modalRegistro.classList.add('active');
    })
    btnCerrarAdvertencia.addEventListener('click', function () {
        modalAdvertencia.classList.remove('active');
    });

    btnCerrarRecuperar.addEventListener('click', function () {
        modalRecuperar.classList.remove('active');
        limpiarFormularioRecuperar();
    });

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function (e) {
        if (e.target === modalRegistro) {
            modalRegistro.classList.remove('active');
            limpiarFormularioRegistro();
        }
        if (e.target === modalLogin) {
            modalLogin.classList.remove('active');
            limpiarFormularioLogin();
        }
        if (e.target === modalAdvertencia) {
            modalAdvertencia.classList.remove('active');
        }
        if (e.target === modalRecuperar) {
            modalRecuperar.classList.remove('active');
            limpiarFormularioRecuperar();
        }
    });

    // ==================== VALIDACIÓN REGISTRO EN TIEMPO REAL ====================

    inputNombre.addEventListener('blur', validarNombre);
    inputNombre.addEventListener('input', function () {
        if (errorNombre.textContent !== '') validarNombre();
    });

    inputCorreo.addEventListener('blur', validarCorreoRegistro);
    inputCorreo.addEventListener('input', function () {
        if (errorCorreo.textContent !== '') validarCorreoRegistro();
    });

    inputCelular.addEventListener('blur', validarCelular);
    inputCelular.addEventListener('input', function () {
        if (errorCelular.textContent !== '') validarCelular();
    });

    inputContrasena.addEventListener('blur', validarContrasenaRegistro);
    inputContrasena.addEventListener('input', function () {
        if (errorContrasena.textContent !== '') validarContrasenaRegistro();
    });

    // ==================== FUNCIONES DE VALIDACIÓN REGISTRO ====================

    function validarNombre() {
        const valor = inputNombre.value.trim();

        if (valor === '') {
            mostrarError(errorNombre, 'El nombre completo es obligatorio');
            return false;
        }

        if (!regexNombre.test(valor)) {
            mostrarError(errorNombre, 'El nombre solo puede contener letras y espacios');
            return false;
        }

        if (valor.length < 3) {
            mostrarError(errorNombre, 'El nombre debe tener al menos 3 caracteres');
            return false;
        }

        ocultarError(errorNombre);
        return true;
    }

    function validarCorreoRegistro() {
        const valor = inputCorreo.value.trim();

        if (valor === '') {
            mostrarError(errorCorreo, 'El correo electrónico es obligatorio');
            return false;
        }

        if (!regexCorreo.test(valor)) {
            mostrarError(errorCorreo, 'Ingrese un correo electrónico válido');
            return false;
        }

        // Verificar si el correo ya está registrado
        const correoExiste = usuarios.some(user => user.correo === valor);
        if (correoExiste) {
            mostrarError(errorCorreo, 'Este correo ya está registrado');
            return false;
        }

        ocultarError(errorCorreo);
        return true;
    }

    function validarCelular() {
        const valor = inputCelular.value.trim();

        if (valor === '') {
            mostrarError(errorCelular, 'El número móvil es obligatorio');
            return false;
        }

        if (!regexCelular.test(valor)) {
            mostrarError(errorCelular, 'Ingrese un número válido (entre 7 y 12 dígitos)');
            return false;
        }

        ocultarError(errorCelular);
        return true;
    }

    function validarContrasenaRegistro() {
        const valor = inputContrasena.value;

        if (valor === '') {
            mostrarError(errorContrasena, 'La contraseña es obligatoria');
            return false;
        }

        if (!regexContrasena.test(valor)) {
            mostrarError(errorContrasena, 'La contraseña debe tener mínimo 6 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales');
            return false;
        }

        ocultarError(errorContrasena);
        return true;
    }

    // ==================== ENVÍO FORMULARIO REGISTRO ====================

    formRegistro.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validar todos los campos
        const nombreValido = validarNombre();
        const correoValido = validarCorreoRegistro();
        const celularValido = validarCelular();
        const contrasenaValida = validarContrasenaRegistro();

        // Si todos son válidos, proceder con el registro
        if (nombreValido && correoValido && celularValido && contrasenaValida) {

            // Crear objeto de usuario
            const nuevoUsuario = {
                nombre: inputNombre.value.trim(),
                correo: inputCorreo.value.trim(),
                celular: inputCelular.value.trim(),
                contrasena: inputContrasena.value,
                bloqueado: false
            };

            // Guardar usuario
            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            // Mostrar mensaje de éxito
            alert('¡Registro exitoso!\n\nYa puedes iniciar sesión con tu cuenta.');

            // Cerrar modal y limpiar formulario
            modalRegistro.classList.remove('active');
            limpiarFormularioRegistro();

            console.log('Usuario registrado:', nuevoUsuario);
        }
    });

    // ==================== VALIDACIÓN CORREO LOGIN EN TIEMPO REAL ====================

    inputLoginCorreo.addEventListener('blur', validarCorreoLogin);
    inputLoginCorreo.addEventListener('input', function () {
        if (errorLoginCorreo.textContent !== '') validarCorreoLogin();
    });

    function validarCorreoLogin() {
        const correo = inputLoginCorreo.value.trim();

        // Limpiar errores previos
        ocultarError(errorLoginCorreo);

        if (correo === '') {
            inputLoginContrasena.disabled = true;
            inputLoginContrasena.style.backgroundColor = '#f0f0f0';
            inputLoginContrasena.style.cursor = 'not-allowed';
            return false;
        }

        if (!regexCorreo.test(correo)) {
            mostrarErrorGrande(errorLoginCorreo, 'Ingrese un correo electrónico válido');
            inputLoginContrasena.disabled = true;
            inputLoginContrasena.style.backgroundColor = '#f0f0f0';
            inputLoginContrasena.style.cursor = 'not-allowed';
            return false;
        }

        // Buscar usuario
        const usuario = usuarios.find(user => user.correo === correo);

        if (!usuario) {
            mostrarErrorGrande(errorLoginCorreo, 'Usuario incorrecto');
            inputLoginContrasena.disabled = true;
            inputLoginContrasena.style.backgroundColor = '#f0f0f0';
            inputLoginContrasena.style.cursor = 'not-allowed';
            return false;
        }

        // Verificar si la cuenta está bloqueada
        if (usuario.bloqueado) {
            mostrarErrorGrande(errorLoginCorreo, 'Cuenta bloqueada por intentos fallidos.');
            mensajeBloqueo.style.display = 'block';
            btnLogin.disabled = true;
            btnLogin.style.opacity = '0.5';
            btnLogin.style.cursor = 'not-allowed';
            inputLoginContrasena.disabled = true;
            inputLoginContrasena.style.backgroundColor = '#f0f0f0';
            inputLoginContrasena.style.cursor = 'not-allowed';
            return false;
        }

        // Si el correo es válido y la cuenta no está bloqueada, habilitar contraseña
        inputLoginContrasena.disabled = false;
        inputLoginContrasena.style.backgroundColor = 'white';
        inputLoginContrasena.style.cursor = 'text';
        ocultarError(errorLoginCorreo);
        return true;
    }

    // ==================== VALIDACIÓN Y ENVÍO LOGIN ====================

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();

        const correo = inputLoginCorreo.value.trim();
        const contrasena = inputLoginContrasena.value;

        // Limpiar errores previos
        ocultarError(errorLoginCorreo);
        ocultarError(errorLoginContrasena);

        // Validar correo primero
        if (!validarCorreoLogin()) {
            return;
        }

        // Validar que la contraseña no esté vacía
        if (contrasena === '') {
            mostrarErrorGrande(errorLoginContrasena, 'La contraseña es obligatoria');
            return;
        }

        // Buscar usuario
        const usuario = usuarios.find(user => user.correo === correo);

        // Inicializar intentos fallidos si no existen
        if (!intentosFallidos[correo]) {
            intentosFallidos[correo] = 0;
        }

        // Verificar contraseña
        if (usuario.contrasena === contrasena) {
            // Login exitoso
            intentosFallidos[correo] = 0; // Resetear intentos

            mostrarExitoGrande(errorLoginContrasena, 'Bienvenido al sistema, ' + usuario.nombre);

            // Cerrar modal y limpiar después de 2 segundos
            setTimeout(function () {
                modalLogin.classList.remove('active');
                limpiarFormularioLogin();
            }, 2000);

            // Aquí puedes redirigir o hacer otra acción
            console.log('Login exitoso:', usuario);
            bienvenido.innerHTML="Bienvenido al sistema, "+usuario.nombre;
            document.getElementById("buttonsUser").style="display:none";
        } else {
            // Contraseña incorrecta
            intentosFallidos[correo]++;

            if (intentosFallidos[correo] >= 3) {
                // Bloquear cuenta
                usuario.bloqueado = true;
                localStorage.setItem('usuarios', JSON.stringify(usuarios));

                mensajeBloqueo.style.display = 'block';
                btnLogin.disabled = true;
                btnLogin.style.opacity = '0.5';
                btnLogin.style.cursor = 'not-allowed';

                inputLoginContrasena.disabled = true;
                inputLoginContrasena.style.backgroundColor = '#f0f0f0';

                mostrarErrorGrande(errorLoginContrasena, 'Cuenta bloqueada por intentos fallidos.');
            } else {
                const intentosRestantes = 3 - intentosFallidos[correo];
                mostrarErrorGrande(errorLoginContrasena, 'Contraseña incorrecta. Intentos restantes: ' + intentosRestantes + '. ⚠️ ADVERTENCIA: La cuenta se bloqueará después de 3 intentos fallidos.');
            }
        }
    });

    // ==================== RECUPERAR CONTRASEÑA ====================

    // Abrir modal de recuperación
    btnRecuperarContrasena.addEventListener('click', function (e) {
        e.preventDefault();

        // Pre-llenar el correo si está disponible
        const correo = inputLoginCorreo.value.trim();
        if (correo) {
            inputRecuperarCorreo.value = correo;
        }

        // Cerrar modal de login y abrir modal de recuperación
        modalLogin.classList.remove('active');
        modalRecuperar.classList.add('active');
    });

    // Validación en tiempo real - Recuperar
    inputRecuperarCorreo.addEventListener('blur', validarCorreoRecuperar);
    inputRecuperarCorreo.addEventListener('input', function () {
        if (errorRecuperarCorreo.textContent !== '') validarCorreoRecuperar();
    });

    inputNuevaContrasena.addEventListener('blur', validarNuevaContrasena);
    inputNuevaContrasena.addEventListener('input', function () {
        if (errorNuevaContrasena.textContent !== '') validarNuevaContrasena();
    });

    inputConfirmarContrasena.addEventListener('blur', validarConfirmarContrasena);
    inputConfirmarContrasena.addEventListener('input', function () {
        if (errorConfirmarContrasena.textContent !== '') validarConfirmarContrasena();
    });

    // Funciones de validación para recuperar
    function validarCorreoRecuperar() {
        const valor = inputRecuperarCorreo.value.trim();

        if (valor === '') {
            mostrarError(errorRecuperarCorreo, 'El correo electrónico es obligatorio');
            return false;
        }

        if (!regexCorreo.test(valor)) {
            mostrarError(errorRecuperarCorreo, 'Ingrese un correo electrónico válido');
            return false;
        }

        // Verificar si el correo existe
        const usuario = usuarios.find(user => user.correo === valor);
        if (!usuario) {
            mostrarError(errorRecuperarCorreo, 'No existe una cuenta con este correo');
            return false;
        }

        ocultarError(errorRecuperarCorreo);
        return true;
    }

    function validarNuevaContrasena() {
        const valor = inputNuevaContrasena.value;

        if (valor === '') {
            mostrarError(errorNuevaContrasena, 'La nueva contraseña es obligatoria');
            return false;
        }

        if (!regexContrasena.test(valor)) {
            mostrarError(errorNuevaContrasena, 'La contraseña debe tener mínimo 6 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales');
            return false;
        }

        ocultarError(errorNuevaContrasena);
        return true;
    }

    function validarConfirmarContrasena() {
        const valor = inputConfirmarContrasena.value;
        const nuevaContrasena = inputNuevaContrasena.value;

        if (valor === '') {
            mostrarError(errorConfirmarContrasena, 'Debe confirmar la contraseña');
            return false;
        }

        if (valor !== nuevaContrasena) {
            mostrarError(errorConfirmarContrasena, 'Las contraseñas no coinciden');
            return false;
        }

        ocultarError(errorConfirmarContrasena);
        return true;
    }

    // Envío del formulario de recuperación
    formRecuperar.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validar todos los campos
        const correoValido = validarCorreoRecuperar();
        const nuevaContrasenaValida = validarNuevaContrasena();
        const confirmarContrasenaValida = validarConfirmarContrasena();

        if (correoValido && nuevaContrasenaValida && confirmarContrasenaValida) {
            const correo = inputRecuperarCorreo.value.trim();
            const nuevaContrasena = inputNuevaContrasena.value;

            // Buscar usuario
            const usuario = usuarios.find(user => user.correo === correo);

            if (usuario) {
                // Actualizar contraseña
                usuario.contrasena = nuevaContrasena;

                // Desbloquear cuenta
                usuario.bloqueado = false;

                // Reiniciar intentos fallidos
                intentosFallidos[correo] = 0;

                // Guardar cambios
                localStorage.setItem('usuarios', JSON.stringify(usuarios));

                // Mostrar mensaje de éxito
                alert('Contraseña actualizada. Ahora puede iniciar sesión.');

                // Cerrar modal y limpiar
                modalRecuperar.classList.remove('active');
                limpiarFormularioRecuperar();

                // Resetear interfaz de login si estaba bloqueada
                mensajeBloqueo.style.display = 'none';
                btnLogin.disabled = false;
                btnLogin.style.opacity = '1';
                btnLogin.style.cursor = 'pointer';

                console.log('Contraseña actualizada para:', correo);
            }
        }
    });

    // ==================== FUNCIONES AUXILIARES ====================

    function mostrarError(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.style.display = 'block';
        const input = elemento.previousElementSibling;
        if (input.tagName === 'INPUT') {
            input.classList.add('error-input');
        } else if (input.classList.contains('password-container')) {
            input.querySelector('input').classList.add('error-input');
        }
    }

    function mostrarErrorGrande(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.style.display = 'block';
        elemento.style.fontSize = '16px';
        elemento.style.fontWeight = '600';
        elemento.style.color = '#f5576c';
        elemento.style.marginTop = '10px';
        const input = elemento.previousElementSibling;
        if (input.tagName === 'INPUT') {
            input.classList.add('error-input');
        } else if (input.classList.contains('password-container')) {
            input.querySelector('input').classList.add('error-input');
        }
    }

    function mostrarExitoGrande(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.style.display = 'block';
        elemento.style.fontSize = '16px';
        elemento.style.fontWeight = '600';
        elemento.style.color = '#28a745';
        elemento.style.marginTop = '10px';
    }

    function ocultarError(elemento) {
        elemento.textContent = '';
        elemento.style.display = 'none';
        elemento.style.fontSize = '';
        elemento.style.fontWeight = '';
        elemento.style.color = '';
        const input = elemento.previousElementSibling;
        if (input.tagName === 'INPUT') {
            input.classList.remove('error-input');
        } else if (input.classList.contains('password-container')) {
            input.querySelector('input').classList.remove('error-input');
        }
    }

    function limpiarFormularioRegistro() {
        formRegistro.reset();
        ocultarError(errorNombre);
        ocultarError(errorCorreo);
        ocultarError(errorCelular);
        ocultarError(errorContrasena);

        // Resetear tipo de contraseña
        const toggleBtn = document.querySelector('[data-target="contrasena"]');
        if (inputContrasena.type === 'text') {
            inputContrasena.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    function limpiarFormularioLogin() {
        formLogin.reset();
        ocultarError(errorLoginCorreo);
        ocultarError(errorLoginContrasena);

        // Deshabilitar el campo de contraseña
        inputLoginContrasena.disabled = true;
        inputLoginContrasena.style.backgroundColor = '#f0f0f0';
        inputLoginContrasena.style.cursor = 'not-allowed';

        // Resetear mensaje de bloqueo
        mensajeBloqueo.style.display = 'none';
        btnLogin.disabled = false;
        btnLogin.style.opacity = '1';
        btnLogin.style.cursor = 'pointer';

        // Resetear tipo de contraseña
        const toggleBtn = document.querySelector('[data-target="loginContrasena"]');
        if (inputLoginContrasena.type === 'text') {
            inputLoginContrasena.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    function limpiarFormularioRecuperar() {
        formRecuperar.reset();
        ocultarError(errorRecuperarCorreo);
        ocultarError(errorNuevaContrasena);
        ocultarError(errorConfirmarContrasena);

        // Resetear tipo de contraseñas
        const toggleBtnNueva = document.querySelector('[data-target="nuevaContrasena"]');
        const toggleBtnConfirmar = document.querySelector('[data-target="confirmarContrasena"]');

        if (inputNuevaContrasena.type === 'text') {
            inputNuevaContrasena.type = 'password';
            toggleBtnNueva.textContent = '👁️';
        }

        if (inputConfirmarContrasena.type === 'text') {
            inputConfirmarContrasena.type = 'password';
            toggleBtnConfirmar.textContent = '👁️';
        }
    }

    // ==================== CONSOLA DE DEBUG ====================
    console.log('Sistema de autenticación cargado');
    console.log('Usuarios registrados:', usuarios.length);

});
