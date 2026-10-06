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

## Fase 2 · Parte A (diseño y estructura de la tarjeta)
- **Género + ocasión (obligatorio):** `personalizar.html` pide "mujer / hombre"; el selector de ocasión y los diseños se filtran solos (`TV.SOLO`, `TV.DISENOS` en `js/config.js`). Mamá y Día de la Mujer son solo para mujer; Papá (nuevo) solo para hombre.
- **Diseño automático:** flores, marco de la foto y decoración cambian según género + ocasión (`js/diseno.js`). El cliente puede cambiarlo entre los que cuadran.
- **Fondos con degradado:** uno por ocasión (`TV.FONDOS`). Si el cliente elige un color, el fondo y las letras toman ese color.
- **Colores:** Azul, Rojo, Negro, Violeta y Amarillo (`TV.PALETA`). Los links antiguos (rosa/noche/ámbar) siguen funcionando.
- **Tipografías:** 3 estilos (`TV.FUENTES`): Scrapbook, Elegante y Moderna.
- **Título y palabra en círculos editables:** el título se ajusta solo para no romper el diseño.
- **Sello de cera:** inicial elegible (por defecto, la de quien recibe).
- **Foto:** opcional; a color o blanco y negro; ajuste de encuadre (arrastrar + zoom) con la proporción real del espacio (`js/foto.js`).
- **3 tamaños:** Tarjeta 1 Postal (~50 palabras), 2 Deslizante (~150) y 3 Tipo libro (200-300+, pasa páginas) (`js/mensaje.js`, `TV.TAMANOS`). El mensaje largo viaja cifrado en el link (`PL.x`).
- **Fechas especiales habilitadas:** Día de la Mujer Boliviana, Halloween, Todos los Santos y Navidad (`activo:true`); sus 12 imágenes se leen de `assets/<fecha>-1..3.jpg`.
- **Panel admin:** lee los campos nuevos del pedido (género, diseño, tamaño, tipografía, título, palabra, sello, mensaje completo, color y modo de foto).
- Estilos nuevos en `css/v14.css`. La portada (Fase 1: `index.html`, `css/hero.css`, `js/fx.js`) no se tocó.

## v15 · Plantillas de fondo integradas
Las 12 imágenes de Día de la Mujer, Halloween, Navidad y Todos Santos ya no son la foto de la tarjeta: son la textura del fondo.
- Capas (css/v14.css, sección v15): imagen con máscara degradada + tinte del color elegido + velo central para que se lea el texto. Los marcos y flores van por encima, igual que antes.
- La foto de la tarjeta es solo la que sube el cliente (o el avatar por defecto).
- Opacidad y encuadre por imagen en `TV.TPL` (js/config.js). Una ocasión nueva solo necesita `_esp({...})` y sus 3 imágenes `assets/<id>-1..3.jpg`.
- En personalizar.html el selector muestra miniaturas con el efecto real. El pedido de WhatsApp sigue enviando `Motivo: N` (admin.html no cambia).
- La imagen para historias también funde la plantilla.

## v16 · Descarga administrativa de la tarjeta (solo vendedor)
En `admin.html` hay un **Paso 4: descargar la tarjeta terminada** para bajar la tarjeta completa en **PNG, JPG o PDF** (con el nombre, el mensaje entero, la foto, el marco, las flores y la plantilla de fondo).
- **Restringido:** la sección arranca bloqueada. Pide tu `ADMIN_PIN`, que se verifica en el servidor (`functions/api/admin.js`, la misma variable que ya usas para firmar). Sin PIN válido no se genera ningún archivo.
- **El cliente no lo ve:** `js/exportar.js` y los botones solo existen en `admin.html`. `index.html`, `personalizar.html` y `r/tarjeta.html` no los cargan.
- **Calidad:** Normal 1020 px, Alta 1360 px (por defecto) o Máxima 2040 px de ancho. El PDF sale a 300 DPI (tamaño físico real, unos 115 mm de ancho en Alta). La tarjeta 2 y 3 salen con el mensaje completo, por eso quedan más altas.
- **Foto:** usa la que subes en el Paso 2 con su resolución original. Sin foto se dibuja el avatar por defecto, igual que en la tarjeta.
- **Opciones:** casilla para incluir o no la marca "Hecha con FRASSMOTTI" (apagada por defecto) y botón de vista previa.
- **Probar en tu computadora:** en `localhost` el panel se abre sin PIN (modo local). En tu dominio real exige PIN y que las Functions estén desplegadas.
- **Archivos nuevos:** `js/exportar.js`, `functions/api/admin.js`. Cambios mínimos: `admin.html` (sección + scripts) y `js/diseno.js` (expone `MINI_DE`).

## v17 · Funciones especiales opcionales (Secreto y Cápsula)
Dos secciones nuevas en `personalizar.html`, cada una con su interruptor. Apagadas, no se muestran sus campos, no viajan en el pedido y no aparecen en la tarjeta.
- **Adivina el secreto (opcional):** mensaje secreto + palabra secreta (sin importar mayúsculas) + **hasta 3 pistas**. El mensaje viaja cifrado (AES-GCM) y solo se abre con la palabra. Quien lo recibe ve la pista 1, puede tocar "Pedir otra pista", y cada intento fallido le suma la siguiente. Dentro de esta misma sección está el **candado del sobre** (pregunta y respuesta para poder romper el sello), también opcional.
- **Cápsula del tiempo (opcional):** el cliente decide si programa la entrega. Al encenderla elige fecha y hora (o un atajo: mañana, en 1 semana, o el día de la ocasión, p. ej. 25 de diciembre). Hasta entonces la tarjeta muestra una cuenta regresiva. Si no la enciende, la tarjeta se abre apenas la recibe.
- **Validaciones:** si enciendes el secreto, exige el mensaje; si enciendes la cápsula, exige la fecha; el candado del sobre exige pregunta y respuesta.
- **Pedido y panel:** el mensaje de WhatsApp trae `Pista 2` y `Pista 3`; `admin.html` los lee solos (campos Pista 2 y Pista 3) y arma el link. Los links anteriores con una sola pista siguen funcionando.
- **Borrador:** los interruptores y las 3 pistas se guardan en el borrador; los borradores viejos con secreto o fecha encienden su interruptor solos.
- **Archivos tocados:** `personalizar.html`, `js/personalizar.js`, `r/tarjeta.html`, `admin.html`. La lógica de la cápsula y del candado del sobre (`js/extras.js`) no cambió.

## v18 · Tutorial interactivo "Tu regalo, de tu idea a sus manos"
Sección deslizable en `index.html` (ancla `#tutorial`, justo debajo de "Edición física") que explica en **8 pasos** el recorrido completo: elegir la ocasión → personalizar (foto, secreto, cápsula) → elegir formato → pagar por Yape → pedido y link por WhatsApp → preparación del accesorio con QR → llegada a casa → el momento de la entrega.
- **Deslizable:** carrusel con scroll-snap (se desliza con el dedo), flechas, puntos, barra de progreso y teclado (← → Inicio Fin). La altura se ajusta a cada paso.
- **Selector de accesorio:** Llavero / Collar / Manilla (se leen de `TV.FISICOS`). Cambia la ilustración y los textos de los pasos 3, 6, 7 y 8. Si desactivas un accesorio en `TV.FISICOS` (`activo:false`), desaparece del tutorial.
- **Ilustraciones:** 8 escenas SVG animadas, sin imágenes externas (no pesan ni dependen de nada). Las animaciones se pausan en los pasos que no se ven y respetan "reducir movimiento".
- **Textos:** están en la lista `PASOS` de `js/tutorial.js` (título, frase emocional, explicación y "consejo de corazón"). Puedes editarlos sin tocar nada más.
- **Config (`js/config.js` > `TV.TUTORIAL`):** `activo:false` oculta toda la sección; `entrega:'3 a 5 días hábiles'` muestra el tiempo estimado en el paso 7 (vacío = no se muestra; no se inventa ningún plazo).
- **Accesos:** botón "Ver el paso a paso, hasta tu casa" en Edición física y enlace "Ver el paso a paso de mi pedido" en el cuadro de pago de `personalizar.html`.
- **Accesibilidad:** región con carrusel anotado, aviso de paso para lectores de pantalla, solo el paso visible es enfocable.
- **Archivos nuevos:** `js/tutorial.js`, `css/tutorial.css`. **Cambios mínimos:** `index.html`, `personalizar.html` (un enlace) y `js/config.js` (la línea `TV.TUTORIAL`). Si borras `js/tutorial.js`, el sitio queda como en la v17.
