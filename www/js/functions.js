//#region mapa

/*
function buildMap(lat, lon, nom_suc, dir_suc) {
    document.getElementById('sucursal_mapa').innerHTML = "<div id='map' style='width: 100%; height: 50%;'></div>";
    var map = L.map('map').setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<strong>${nom_suc}</strong><br>${dir_suc}`)
        .openPopup()
}
*/

function crear_mapa() {
    navigator.geolocation.getCurrentPosition(function (pos) {
        let lat_dispositivo = pos.coords.latitude;
        let lng_dispositivo = pos.coords.longitude;
        //aqui deben ir coordenadas de dispositivo con icono
        document.getElementById('sucursal_mapa').innerHTML = "<div id='map' style='width: 100%; height: 50%;'></div>";
        var map = L.map('map').setView([lat_dispositivo, lng_dispositivo], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //icono personalizado mapa
        var avatar_icon = L.icon({
            iconUrl: 'img/icon.png',
            shadowUrl: 'img/icon.png',

            iconSize: [50, 43], // size of the icon
            shadowSize: [0, 0], // size of the shadow
            iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [0, 0],  // the same for the shadow
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });

        L.marker([lat_dispositivo, lng_dispositivo], { icon: avatar_icon }).addTo(map);

        return map;
    });

}

function Agregar_marker_sucursal_a_mapa_2(respuesta_api) {
    //agregar posicion del dispositivo
    navigator.geolocation.getCurrentPosition(function (pos) {
        //aqui deben ir coordenadas de dispositivo con icono
        let lat_dispositivo = pos.coords.latitude;
        let lng_dispositivo = pos.coords.longitude;
        //crear mapa
        document.getElementById('sucursal_mapa').innerHTML = "<div id='map' style='width: 100%; height: 50%;'></div>";
        var map = L.map('map').setView([lat_dispositivo, lng_dispositivo], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //icono personalizado mapa
        var avatar_icon = L.icon({
            iconUrl: 'img/icon.png',
            shadowUrl: 'img/icon.png',

            iconSize: [50, 43], // size of the icon
            shadowSize: [0, 0], // size of the shadow
            iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [0, 0],  // the same for the shadow
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });

        L.marker([lat_dispositivo, lng_dispositivo], { icon: avatar_icon }).addTo(map);

        //recorro sucursales
        $.each(respuesta_api, function (pos, info_sucursal) {
            //request coordenadas
            $.ajax({
                url: `https://nominatim.openstreetmap.org/search?street=${info_sucursal.direccion}&city=${info_sucursal.ciudad}&country=${info_sucursal.pais}&format=json`,
                type: "GET",
                dataType: "json",
                success: function (respuesta_coords) {
                    //ingresar a lista de datos
                    $.each(respuesta_coords, function (pos, respuesta_coords) {
                        //alert(info_sucursal_map.lat + " " + info_sucursal_map.lon);
                        //mapa   
                        L.marker([respuesta_coords.lat, respuesta_coords.lon]).addTo(map)
                            .bindPopup(`<strong>${info_sucursal.nombre}</strong><br>${info_sucursal.direccion}`)
                            .openPopup()
                    });
    
                },
                error: function (xml, error, status) {
                    ons.notification.toast(xml.responseJSON.description, { timeout: 4000 });
                },
                complete: function () {
                    $("#cargando").hide();
                }
            });
        });

    });
}


//pedir coordenadas de mapa - ajax
function Agregar_marker_sucursal_a_mapa(respuesta_api) {
    //crear mapa
    let mapa_sucursales = crear_mapa();
    //recorro sucursales
    $.each(respuesta_api, function (pos, info_sucursal) {
        //request coordenadas
        $.ajax({
            url: `https://nominatim.openstreetmap.org/search?street=${info_sucursal.direccion}&city=${info_sucursal.ciudad}&country=${info_sucursal.pais}&format=json`,
            type: "GET",
            dataType: "json",
            success: function (respuesta_coords) {
                //ingresar a lista de datos
                $.each(respuesta_coords, function (pos, respuesta_coords) {
                    //alert(info_sucursal_map.lat + " " + info_sucursal_map.lon);
                    //mapa   
                    L.marker([respuesta_coords.lat, respuesta_coords.lon]).addTo(mapa_sucursales)
                        .bindPopup(`<strong>${info_sucursal.nombre}</strong><br>${info_sucursal.direccion}`)
                        .openPopup()
                });

            },
            error: function (xml, error, status) {
                ons.notification.toast(xml.responseJSON.description, { timeout: 4000 });
            },
            complete: function () {
                $("#cargando").hide();
            }
        });
    });
}
//#endregion mapa

//#region fn
window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (template, pagina_id, params) {
    var menu = document.getElementById("menu");
    menu.close();
    let nav = document.getElementById("nav");
    for (i = 0; i < nav.pages.length; i++) {
        if (nav.pages[i]["id"] == pagina_id) {
            nav.bringPageTop(i, params);
            return;
        }
    }
    nav.pushPage(template, params);
    nav.options = { animation: "lisft", animationOptions: { duration: 0.5 } };
};

//#endregion fn

//#region favoritos
var datos_productos = {};

function inicializar_favoritos() {
    if (!localStorage.getItem("favoritos")) {
        localStorage.setItem("favoritos", JSON.stringify([]));
    }
}

function buscar_producto(id_producto) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos"));
    let usr = {};
    for (i = 0; i < favoritos.length; i++) {
        usr = favoritos[i];
        if (usr.id == id_producto) {
            return usr;
        }
    }

    return null;
}

function eliminar_favorito(datos_producto) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos"));
    let usr = {};
    for (i = 0; i < favoritos.length; i++) {
        usr = favoritos[i];
        if (usr.id == datos_producto.id) {
            favoritos.splice(i, 1);
            break;
        }
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function eliminar_producto_favorito() {
    eliminar_favorito(datos_producto);
    ons.notification.toast("El producto se elimin&oacute; correctamente de favoritos", { timeout: 3000 });
    $("#spd_quitar_favorito").attr('disabled', true);
    $("#spd_agregar_favorito").attr('disabled', false);
}

function agregar_favorito(datos_producto) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos"));
    favoritos.push(datos_producto);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function agregar_producto_favorito() {
    agregar_favorito(datos_producto);
    ons.notification.toast("El producto se agreg&oacute; correctamente a favoritos", { timeout: 3000 });
    $("#spd_quitar_favorito").attr('disabled', false);
    $("#spd_agregar_favorito").attr('disabled', true);
}
////#endregion favoritos

//#region ajaxsetup
function ajax_setup(codigo) {
    if (localStorage.getItem("token") != null) {
        if (codigo != null) {
            $.ajaxSetup({
                headers: {
                    "Content-Type": "application/json",
                    "x-auth": localStorage.getItem("token"),
                    "codigo": codigo
                }
            });
        } else {
            $.ajaxSetup({
                headers: {
                    "Content-Type": "application/json",
                    "x-auth": localStorage.getItem("token")
                }
            });
        }
    } else {
        fn.load('temp_login', 'pag_login');
    }
}

//#endregion ajaxsetup

//#region login
function login(datos) {
    datos = JSON.stringify(datos);
    //ajax setup 
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        }
    });
    //objeto JS
    let url = `https://ort-tallermoviles.herokuapp.com/api/usuarios/session`;
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: datos,
        success: function (respuesta) {
            $.ajaxSetup({
                headers: {
                    "Content-Type": "application/json",
                    "x-auth": respuesta.data.token
                }
            });
            sessionStorage.setItem("usuario", JSON.stringify(respuesta.data));
            localStorage.setItem("token", respuesta.data.token);
            let nav = document.getElementById("nav");
            fn.load('temp_pantalla_principal', 'pag_pantalla_principal');
        },
        error: function (xml, error, status) {
            ons.notification.toast(xml.responseJSON.error, { timeout: 4000 });
        }
    });

}

function verificar_login() {
    if (localStorage.getItem("email") && localStorage.getItem("pass")) {
        let datos = {
            "email": localStorage.getItem("email"),
            "password": localStorage.getItem("pass")
        }
        login(datos);
    }
}

function scanCallBack(err, text){
    if(err){
        console.log(err);
    }
    QRScanner.hide();
    //si todo ok, por ejemplo el parametro text tiene https://ort-tallermoviles.herokuapp.com/api/productos?codigo=PRCODE001
    fn.load("t_info_local","p_info_local", {data:{url_local:text}});
}

//#endregion login

$(document).ready(function () {
    //DOM ready => se puede manipular elementos html desde JS
    //alert('ready');
    inicializar_favoritos();
    verificar_login();

    //function CONFIRM
    $(document).on("click", ".sign_out", function () {
        let message = "Seguro deseas cerrar sesi&oacute;n?";
        let options = {
            buttonLabel: ["Si", "No"], title: "Cerrar Sesi&oacute;n", callback: function (pos) {
                if (pos == 0) {
                    localStorage.removeItem("email");
                    localStorage.removeItem("pass");
                    fn.load('temp_login', 'pag_login');
                    ons.notification.toast("La sesi&oacute;n ha finalizado correctamente", { timeout: 2000 });
                }
            }
        };
        ons.notification.confirm(message, options);

    });

    //function MOSTRAR OCULTAR PASSWORD
    $(document).on("click", "#mostrar_pwd", function () {
        if ($(this).attr("icon") == 'fa-eye') {
            $(this).attr("icon", "fa-eye-slash");
            $("#login_password").attr("type", "password");
        }
        else {
            $(this).attr("icon", "fa-eye");
            $("#login_password").attr("type", "text");
        }
    });

    //function RECORDAR SESION DE USUARIO - LOGIN
    $(document).on("click", "#swt_recordar_password", function () {
        let recordar = document.getElementById("swt_recordar_password");
        if (recordar.checked) {
            let email = $("#login_usuario").val();
            let pass = $("#login_password").val();
            localStorage.setItem("email", email);
            localStorage.setItem("pass", pass);
        }
        else {
            localStorage.removeItem("email");
            localStorage.removeItem("pass");
            localStorage.removeItem("token");
        }
    });

    //send home
    $(document).on("click", ".send_home", function () {
        //let id_producto = $(this).data("id");
        fn.load('temp_pantalla_principal', 'pag_pantalla_principal');
    });

    //desde listado productos a info producto
    $(document).on("click", ".listado_productos_listado_class", function () {
        let id_producto = $(this).data("id");
        let codigo_producto = $(this).data("codigo");
        //alert(codigo_producto);
        fn.load('temp_info_producto', 'pag_info_producto', { data: { codigo: codigo_producto } });
    });

    //desde info producto a alta pedido
    $(document).on("click", ".realizar_pedido_btn", function () {
        let codigo_producto = $(this).data("codigo");
        let id_producto = $(this).data("id");
        //alert(codigo_producto);
        fn.load('temp_alta_pedido', 'pag_alta_pedido', { data: { codigo: codigo_producto, id: id_producto } });
    });

    //#region login
    $(document).on("click", "#login_btn", function () {
        let mail = $("#login_usuario").val();
        let pass = $("#login_password").val();

        try {
            if (!mail) {
                throw "Usuario requerido";
            }
            // /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/ VALIDAR EMAIL
            if (!/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/.test(mail)) {
                throw "Email no v&aacute;lido";
            }
            if (!pass) {
                throw "Contrase&ntilde;a requerida";
            }

            let datos = {
                "email": mail,
                "password": pass
            };
            //CONVERTIR EL OBJETO 'DATOS' A TEXTO PLANO, PARA QUE LO ACEPTE LA API
            //puede ser NECESARIO PARA LA API o NO
            //datos = JSON.stringify(datos);

            login(datos);

        } catch (error) {
            ons.notification.toast(error, { timeout: 2000 });
        }
    });
    //#endregion login

    //#region registrarse
    $(document).on("click", "#registrarse_btn", function () {
        let nombre = $("#registro_nombre").val();
        let apellido = $("#registro_apellido").val();
        let mail = $("#registro_email").val();
        let direccion = $("#registro_direccion").val();
        let pass1 = $("#registro_password").val();
        let pass2 = $("#registro_password_repeat").val();

        try {
            if (!nombre) {
                throw "Nombre requerido";
            }
            // /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/ VALIDAR EMAIL
            if (!/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/.test(mail)) {
                throw "Email no v&aacutelido";
            }
            if (!apellido) {
                throw "Apellido no v&aacute;lido";
            }
            if (!mail) {
                throw "Email requerida";
            }
            if (!direccion) {
                throw "Genero requerida";
            }
            if (pass1.length < 8) {
                throw "Contrase&ntilde;a debe ser de 8 o mas caracteres";
            }
            if (!pass1) {
                throw "Contrase&ntilde;a requerida";
            }
            if (!pass2) {
                throw "Contrase&ntilde;a requerida";
            }
            if (pass1 !== pass2) {
                throw "Contrase&ntilde;as deben ser iguales";
            }

            let datos = {
                "nombre": nombre,
                "apellido": apellido,
                "email": mail,
                "direccion": direccion,
                "password": pass1
            };

            //CONVERTIR EL OBJETO 'DATOS' A TEXTO PLANO, PARA QUE LO ACEPTE LA API
            //puede ser NECESARIO PARA LA API o NO
            datos = JSON.stringify(datos);

            //ajax setup 
            $.ajaxSetup({
                headers: {
                    "Content-Type": "application/json"
                }
            });
            //objeto JS
            let url = `https://ort-tallermoviles.herokuapp.com/api/usuarios`;
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                data: datos,
                success: function (respuesta) {
                    fn.load('temp_login', 'pag_login');
                    ons.notification.toast("Registrado corretamente", { timeout: 2000 });
                },
                error: function (xml, error, status) {
                    ons.notification.toast(xml.responseJSON.error, { timeout: 4000 });
                }
            });

        } catch (error) {
            ons.notification.toast(error, { timeout: 2000 });
        }
    });
    //#endregion registrarse


    //#region redirigir a registro
    $(document).on("click", "#login_register_btn", function () {
        fn.load('temp_registro', 'pag_registro');
        nav.options = { animation: "lisft", animationOptions: { duration: 2 } };
    });
    //#endregion redirigir a registro

    // MAIN MENU
    $(document).on("click", ".listado_pedidos", function () {
        let id_pedido = $(this).data("id");
        fn.load('temp_info_producto', 'pag_info_producto', { data: { id: id_pedido } });
    });

    // Agregar cantidad, alta pedido
    $(document).on("click", "#agregar_cantidad_btn", function () {

        let number = $("#cantidad_alta_pedido").val();
        let unitPrice = $("#producto_info_span_precio").val();
        let finalPrice = unitPrice * number;

        if (number > 0) {
            $("#producto_info_span_precio_final").push(finalPrice);
            console.log(finalPrice); // Está entrando al if, el problema es que no esta tomando los valores
        }
        else {
            alert("Ingrese un número mayor a 0.")
        }
    });

    //#region redirigir a código qr
    $(document).on("click","#btn_escanear_qr",function(){
        fn.load("t_escanear_qr","p_escanear_qr");
    });

    $(document).on("click","#btn_cancelar_qr",function(){
        QRScanner.hide();
        fn.load('t_locales','p_locales'); 
    });
    //#endregion redirigir a código qr
});