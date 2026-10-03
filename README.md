# FRASSMOTTI v10
HTML + Tailwind (CDN) + JS puro. Tienda, checkout, tarjeta final y panel de pedidos con cobro verificado.

## Flujo del negocio
1. El cliente personaliza y paga por Yape; el pedido llega a tu WhatsApp con un link de vista previa.
2. Verificas el pago y abres `/admin.html`: pegas el pedido, ingresas tu PIN y firmas el link.
3. Le envías el link activado. Sin firma, la tarjeta muestra "Vista previa" y bloquea secreto, compartir e imagen.

## Desplegar en Cloudflare Pages (con Functions)
Las Functions NO funcionan con "arrastrar y soltar". Usa una de estas:
- `npx wrangler pages deploy . --project-name frassmotti`
- o Git: sube la carpeta a GitHub, Pages > Connect to Git, preset None, sin build command, output `/`.

Luego: Pages > tu proyecto > Settings > Variables and Secrets (Production), crea:
- `ADMIN_PIN`: tu PIN para entrar al panel.
- `SIGNING_SECRET`: texto largo aleatorio (40+ caracteres). Si lo cambias, los links ya firmados dejan de valer.
Vuelve a desplegar para que tomen efecto.

Sin Functions (pruebas o hosting estático): en `js/config.js` pon `REQUIRE_PAYMENT:false`.

## Configuración (js/config.js)
`WHATSAPP`, `PRECIO`, `REQUIRE_PAYMENT`, `QR_IMAGE:'assets/qr-pago.png'`, `MUSIC:'assets/musica.mp3'` y las plantillas.

## Seguridad
El mensaje secreto se cifra (AES-GCM) con la clave y viaja en el `#` del link. La firma HMAC impide fabricar links activados.

## Efectos 3D (v6)
- Hero con escena Three.js (tarjeta con barniz, luces y confeti 3D). Si el dispositivo no tiene WebGL o prefiere menos movimiento, se muestra una tarjeta CSS.
- Tarjetas con inclinación 3D y brillo; la tarjeta final se inclina con el giroscopio en celulares.
- Sobre 3D de apertura en `r/tarjeta.html`. Todo en `js/fx.js` y `css/styles.css`.

## Diseño de la carta (v7)
`r/tarjeta.html` usa el diseño 'Carta 3D' (sobre oscuro, sello de cera, tarjeta scrapbook con foto en blanco y negro, sonidos). Estilos en `css/carta.css`, sonidos y parallax en `js/carta.js`. Título y palabra en círculos cambian por plantilla; se pueden forzar con `?titulo=Feliz&palabra=CUMPLE`.

## WhatsApp
Todo el sitio usa Click-to-Chat (`wa.me`) hacia el número de `WHATSAPP` en `js/config.js` (59165153083): botón flotante, enlaces de contacto y el pedido. Para cambiar el número, edita solo esa línea. Cualquier enlace nuevo: `<a data-wa="Mensaje">` y `js/wa.js` lo conecta.

## Escenarios (v9)
Cada plantilla en `js/config.js` tiene su paleta `K` (fondo, sobre, sello, papel, acento), título y palabra en círculos. El cliente puede sobreescribir solo el acento. Ejemplos en vivo: `r/tarjeta.html?nombre=Carla&t=amor&ej=1` (el modo ejemplo solo se desbloquea con ese contenido exacto).

## Flujo simple de pedidos (v10)
1. El cliente personaliza, paga y te llega un mensaje CORTO por WhatsApp (sin links; si subió foto, te la manda en el chat).
2. Abres `admin.html`, pegas el mensaje y se llena todo solo. Añades la foto si la hay y tocas "Generar link".
3. Tocas "WhatsApp" para enviarle el link al cliente.
`REQUIRE_PAYMENT:false` (por defecto): no necesitas PIN ni Functions; funciona subiendo la carpeta a Cloudflare. Para firma estricta con PIN, pon `true` y sigue la sección de Functions.

## Extras mágicos (v11)
Todo lo nuevo vive en `js/extras.js` + `css/extras.css` (se cargan al final de `r/tarjeta.html`). Si borras esas dos líneas, la tarjeta vuelve a ser la v10.
- **Marca de agua viral**: "Hecha con FRASSMOTTI · Crea la tuya" al pie de la tarjeta, en el texto de Compartir y en la imagen para historias. Se apaga con `WATERMARK:false` en `js/config.js`.
- **Cápsula del tiempo**: `?abre=2026-12-24T00:00`. El sello muestra un candado y una cuenta regresiva hasta la fecha. Usa la hora del servidor (cabecera `Date`), no la del celular. Con `REQUIRE_PAYMENT:true` la fecha queda dentro de la firma y no se puede editar.
- **Cerradura con pregunta**: antes de romper el sello hay que responder una pregunta. La respuesta NO viaja en el link: se usa como clave de cifrado (AES-GCM, ignora tildes y mayúsculas).
- **Modo oficina**: botón "Oficina" arriba. Tapa la tarjeta con una hoja de Excel (cambia título y favicon de la pestaña y silencia el sonido). Se vuelve con la pestaña "Hoja2" o con Esc dos veces seguidas (tecla jefe). `?of=1` abre la tarjeta ya disfrazada.
- **Agitar / Soplar**: botón "Agitar / Soplar" en la barra de la tarjeta. Agitar = lluvia de emojis según la plantilla (necesita sensor de movimiento). Soplar = velita que se apaga soplando al micrófono (solo mide volumen; no graba). Sin micrófono, se apaga tocando la llama. Los umbrales se ajustan en las constantes `BLOW` y `SHAKE` al inicio de `extras.js`.
- **Pedido y panel**: `personalizar.html` tiene la sección "Extras mágicos" y el mensaje de WhatsApp trae 4 líneas nuevas (`Pregunta cerradura`, `Respuesta cerradura`, `Abre el`, `Modo oficina`). `admin.html` las lee solas al pegar el pedido.

## v12
Ver INSTRUCCIONES_INSTALACION.md. Interruptores en js/config.js (TV.FUNCIONES y activo por plantilla); ?dev=1 muestra todo para pruebas.

## v13
Marca FRASSMOTTI, edición física en index, QR descargable y comprobante en el checkout. Ver INSTRUCCIONES_INSTALACION.md.
