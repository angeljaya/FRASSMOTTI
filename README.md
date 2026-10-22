# FRASSMOTTI
HTML + Tailwind 3.4 compilado + JS puro, en Cloudflare Pages (Functions + KV). Tienda, checkout con buzón cifrado de pedidos, tarjeta final y panel de pedidos.
_Última actualización: 22 de octubre de 2026. Las secciones v10 a v20 de abajo son el historial de cada versión; donde algo cambió, se indica._

## Estructura del proyecto
- Raíz: `index.html`, `personalizar.html`, `admin.html`, `grupo.html`, `404.html`, `favicon.svg`, `_headers`, `wrangler.toml.ejemplo`, `README.md`, `INSTRUCCIONES_INSTALACION.md`, `tailwind.config.js`, `tailwind-entrada.css`.
- `r/tarjeta.html`: la tarjeta que recibe el destinatario.
- `css/`: `styles`, `hero`, `tutorial`, `carta`, `extras`, `v14` y `tailwind.css` (generado; ver "Estilos").
- `js/`: `config`, `secret`, `buzon`, `personalizar`, `pago`, `wa`, `nuevas`, `diseno`, `foto`, `mensaje`, `fx`, `carta`, `extras`, `acciones`, `doubletap`, `exportar` (solo admin), `tutorial`. `tw.js` ya no lo carga ninguna página.
- `functions/api/`: `admin`, `card`, `pedido`, `sign`, `verify`.
- `assets/`: imágenes de ocasiones y productos, `fondo-naturaleza.jpg`, `qr-pago.png`.

## Flujo del negocio (actual: buzón cifrado)
1. El cliente personaliza en `personalizar.html`, paga por Yape y adjunta el comprobante.
2. Al tocar "Ya pagué, enviar pedido", el pedido (texto y foto) se **cifra en su navegador** (AES-GCM + llave pública RSA-OAEP, `TV.PEDIDOS_PUBKEY`) y se guarda en el KV `PEDIDOS` mediante `/api/pedido`. Por WhatsApp solo viajan un **código** (ej. `K7F2-9QXA`) y el comprobante. El pedido caduca a los 30 días.
3. En `admin.html` ves los pedidos pendientes, los descifras con tu **llave privada** (guardada solo en el IndexedDB de tu dispositivo) y el formulario se llena solo. También puedes usar "Abrir por código" con el código que te mandó el cliente.
4. Verificas el pago, revisas los datos, generas el link (corto, ver v20) y lo envías al cliente por WhatsApp.
5. Con `REQUIRE_PAYMENT:true`, un link sin firma muestra "Vista previa" y bloquea secreto, compartir e imagen (la firma se genera en `admin.html`).

**Buzón de pedidos** (`js/buzon.js`, `functions/api/pedido.js`, interruptor `TV.BUZON` en `js/config.js`):
- La llave privada se crea una vez en `admin.html` > "Llave del buzón". Se muestra una sola vez para que la respaldes (en tu gestor de contraseñas) y luego queda guardada como no extraíble. Si la pierdes, no puedes abrir los pedidos guardados.
- El celular del cliente propone el código del pedido, así un reintento (mala señal, doble toque) reenvía el MISMO pedido y no lo duplica. Hay un reintento automático.
- Límite de envíos por IP: 40 por hora (las operadoras bolivianas comparten IP). Los rechazos se ven en Cloudflare > Functions > Real-time logs.
- Si algo falla, el cliente ve un cuadro rojo fijo con el motivo y un plan B: enviar el pedido completo directo por WhatsApp. El botón "Abrir WhatsApp con mi pedido" siempre aparece en la pantalla de éxito, y "Cambiar algo de mi tarjeta" reemplaza el pedido con el mismo código.
- El monto que lleva el pedido sigue el formato elegido (tarjeta virtual o llavero).
- Si `TV.BUZON` es `false` o falta la llave pública, todo funciona como en la v10.

## Desplegar en Cloudflare Pages (con Functions)
Las Functions NO funcionan con "arrastrar y soltar". Usa una de estas:
- `npx wrangler pages deploy . --project-name frassmotti`
- o Git: sube la carpeta a GitHub, Pages > Connect to Git, preset None, sin build command, output `/`.

Luego: Pages > tu proyecto > Settings > Variables and Secrets (Production), crea:
- `ADMIN_PIN`: tu PIN para entrar al panel.
- `SIGNING_SECRET`: texto largo aleatorio (40+ caracteres). Si lo cambias, los links ya firmados dejan de valer.
- `TURNSTILE_SECRET` (opcional, solo si activas Turnstile; ver Pendientes).
Además, crea dos **KV namespaces** y enlázalos al proyecto (Settings > Bindings > KV) con estos nombres exactos: `CARDS` (links cortos y bloqueos por IP) y `PEDIDOS` (buzón).
Vuelve a desplegar para que tomen efecto.

### Estilos (Tailwind compilado)
Las páginas ya no usan el CDN de Tailwind: cargan `css/tailwind.css`, enlazado al final del `<head>` para mantener el orden de cascada que tenía el CDN. Se genera en tu PC (no hace falta `package.json`):
`npx tailwindcss@3.4.17 -i tailwind-entrada.css -o css/tailwind.css --minify`
- Usa la **versión 3.4**, no la 4 (cambia valores por defecto y movería el diseño).
- `tailwind.config.js` revisa todos los `.html` y los `.js` de `js/`, y trae los mismos valores que tenía `tw.js` (`accent` y `3xl`).
- Cada vez que agregues clases de Tailwind nuevas en cualquier archivo, vuelve a compilar y sube `css/tailwind.css`.

Sin Functions (pruebas o hosting estático): en `js/config.js` pon `REQUIRE_PAYMENT:false`.

## Configuración (js/config.js)
`WHATSAPP`, precios (`PROMO` con `precio`, `inicio` y `dias`; `PRECIO_NORMAL`; `PRECIO_LLAVERO`), `REQUIRE_PAYMENT`, `SHORT_LINKS`, `BUZON`, `PEDIDOS_PUBKEY`, `TURNSTILE_SITEKEY` (opcional), `WATERMARK`, `QR_IMAGE:'assets/qr-pago.png'`, `MUSIC:'assets/musica.mp3'`, `FUNCIONES` y las plantillas. El precio de la promo y su fin se calculan con el reloj del celular del visitante; el control real es verificar el monto en el comprobante.

## Seguridad
- El mensaje secreto se cifra (AES-GCM) con la clave y viaja en el `#` del link. La firma HMAC impide fabricar links activados. La protección real depende de que la palabra secreta no sea fácil de adivinar (quien tenga el link puede probar palabras sin conexión).
- `ADMIN_PIN`: usa una clave larga y aleatoria. `sign.js` y `card.js` lo comparan en tiempo constante y bloquean la IP tras 5 fallos (claves `rl:IP` en el KV `CARDS`). `admin.js` solo agrega una espera de 700 ms por intento (pendiente: darle el mismo bloqueo por IP).
- Se eliminaron `guardar.js` y `obtener.js` (funciones antiguas sin PIN que nadie usaba). Si reaparecen en el repositorio, bórralas.
- Los pedidos del buzón viajan y se guardan cifrados, pero tú los ves descifrados en el admin; el texto de la tienda debe decirlo con claridad (no prometer que nadie los ve).
- `admin.html` ya no carga scripts de terceros para los estilos, lo que reduce el riesgo de que un servidor ajeno lea tu PIN o tu llave.
- `_headers` solo define `nosniff`, `Referrer-Policy` y `X-Frame-Options` (y `noindex` en admin). No hay CSP ni reglas de caché todavía.

## Efectos 3D (v6)
- Hero con escena Three.js (tarjeta con barniz, luces y confeti 3D). Si el dispositivo no tiene WebGL o prefiere menos movimiento, se muestra una tarjeta CSS.
- Tarjetas con inclinación 3D y brillo; la tarjeta final se inclina con el giroscopio en celulares.
- Sobre 3D de apertura en `r/tarjeta.html`. Todo en `js/fx.js` y `css/styles.css`.

## Diseño de la carta (v7)
`r/tarjeta.html` usa el diseño 'Carta 3D' (sobre oscuro, sello de cera, tarjeta scrapbook con foto en blanco y negro, sonidos). Estilos en `css/carta.css`, sonidos y parallax en `js/carta.js`. Título y palabra en círculos cambian por plantilla; se pueden forzar con `?titulo=Feliz&palabra=CUMPLE`.

## WhatsApp
Todo el sitio usa Click-to-Chat (`wa.me`) hacia el número de `WHATSAPP` en `js/config.js` (591651.....): botón flotante, enlaces de contacto y el pedido. Para cambiar el número, edita solo esa línea. Cualquier enlace nuevo: `<a data-wa="Mensaje">` y `js/wa.js` lo conecta.

## Escenarios (v9)
Cada plantilla en `js/config.js` tiene su paleta `K` (fondo, sobre, sello, papel, acento), título y palabra en círculos. El cliente puede sobreescribir solo el acento. Ejemplos en vivo: `r/tarjeta.html?nombre=Carla&t=amor&ej=1` (el modo ejemplo solo se desbloquea con ese contenido exacto).

## Flujo simple de pedidos (v10, histórico: reemplazado por el buzón cifrado, ver "Flujo del negocio")
1. El cliente personaliza, paga y te llega un mensaje CORTO por WhatsApp (sin links; si subió foto, te la manda en el chat).
2. Abres `admin.html`, pegas el mensaje y se llena todo solo. Añades la foto si la hay y tocas "Generar link".
3. Tocas "WhatsApp" para enviarle el link al cliente.
`REQUIRE_PAYMENT:false` (por defecto): no necesitas PIN ni Functions; funciona subiendo la carpeta a Cloudflare. Para firma estricta con PIN, pon `true` y sigue la sección de Functions.

## Extras mágicos (v11)
Todo lo nuevo vive en `js/extras.js` + `css/extras.css` (se cargan al final de `r/tarjeta.html`). Si borras esas dos líneas, la tarjeta vuelve a ser la v10.
- **Marca de agua viral**: "Hecha con FRASSMOTTI · Crea la tuya" al pie de la tarjeta, en el texto de Compartir y en la imagen para historias. Se apaga con `WATERMARK:false` en `js/config.js`.
- **Cápsula del tiempo**: `?abre=2026-12-24T00:00`. El sello muestra un candado y una cuenta regresiva hasta la fecha. Usa la hora del servidor (cabecera `Date`), no la del celular. Con `REQUIRE_PAYMENT:true` la fecha queda dentro de la firma y no se puede editar.
- **Cerradura con pregunta**: antes de romper el sello hay que responder una pregunta. La respuesta NO viaja en el link: se usa como clave de cifrado (AES-GCM, ignora tildes y mayúsculas).
- **Modo discreto (antes "Oficina")**: ya no hay botón suelto en la barra; se activa desde el panel Interacciones. Tapa la tarjeta con una hoja de Excel (cambia título y favicon de la pestaña y silencia el sonido). Se vuelve con la pestaña "Hoja2" o con Esc dos veces seguidas (tecla jefe). `?of=1` abre la tarjeta ya disfrazada.
- **Agitar / Soplar**: se activa desde el panel Interacciones. Agitar = lluvia de emojis según la plantilla (necesita sensor de movimiento). Soplar = velita que se apaga soplando al micrófono (solo mide volumen; no graba). Sin micrófono, se apaga tocando la llama. Los umbrales se ajustan en las constantes `BLOW` y `SHAKE` al inicio de `extras.js`.
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

## Experiencia de pago Yape: "¡Envío con éxito!"
- Al tocar "Ya pagué, enviar pedido" con el comprobante adjunto y completarse el envío (menú Compartir de WhatsApp, o chat abierto), aparece un aviso a pantalla completa: **¡Envío con éxito!** en verde grande con efecto 3D, check animado, confeti y vibración corta.
- No aparece si falta el comprobante ni si el cliente cancela el menú Compartir.
- Si el navegador bloquea la ventana de WhatsApp, el aviso muestra un botón "Abrir WhatsApp con mi pedido".
- Respeta "reducir movimiento" del sistema. Archivos: `personalizar.html` (#okEnvio), `css/v14.css` (bloque .ok-*), `js/personalizar.js` (exito) y `js/pago.js` (waAbrir).

## Ejemplo en vivo (móvil) y menú "Hacer la mía"
- **Menú:** "Elegir mi tarjetita" (portada) y "Ver tarjetitas" (cabecera) ahora dicen **Hacer la mía**; en la tarjeta, el botón "Crear la mía" también.
- **Ejemplo en vivo** (`r/tarjeta.html?...&ej=1`): sin trivia; en su lugar, un **secreto con candado** de demostración (palabra de ejemplo: *mariposa*, 3 pistas, funciona sin cifrado ni https). El botón "Secreto" late para invitar a tocarlo y el modal indica "Ejemplo en vivo". Tras 3 fallos se revela la palabra del ejemplo.
- **Responsivo:** se corrigió el desborde horizontal que ensanchaba la página en celulares (resplandor `.bg-glow`), la barra de acciones cabe completa desde 320 px, la barra superior queda con iconos en pantallas chicas y la carta se ajusta en celular horizontal sin tapar las barras. Estilos en `css/v14.css` (bloque "Ejemplo en vivo y tarjeta").
- Las tarjetas reales de clientes no cambian (mantienen su botón Trivia y su Secreto solo si el cliente lo activó).

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

## v20 · Links cortos con Cloudflare KV (`tarjeta.html?id=XXXXXXXX`)
Antes el link llevaba todo (datos y foto en Base64) y medía varios miles de caracteres, imposible de usar bien en un QR. Ahora los datos se guardan en KV y el link mide unos 50 caracteres.
- **Cómo funciona:** `admin.html` envía a `/api/card` exactamente lo que antes iba en la URL (`qs` = la parte después del `?`, `h` = el payload cifrado con foto, secreto, pistas y audio). La función genera un id aleatorio de 8 caracteres y lo guarda en el KV `CARDS`. `r/tarjeta.html?id=...` lo lee y sigue con la misma lógica de siempre; el resto del código no cambió.
- **Seguridad:** solo se puede guardar con tu `ADMIN_PIN` (verificado en el servidor). Leer es público, pero el id es aleatorio e imposible de adivinar. El secreto sigue cifrado con su palabra: ni KV lo ve. Una tarjeta que está en KV se considera pagada, por eso no necesita firma.
- **Si KV falla** (no está configurado, sin PIN en el servidor o sin conexión), `admin.html` avisa y entrega el link largo de siempre, así nunca te quedas sin poder entregar. Un PIN incorrecto sí se rechaza.
- **Apagarlo:** `TV.SHORT_LINKS:false` en `js/config.js` devuelve el comportamiento anterior. Los links largos ya entregados siguen funcionando siempre.
- **Archivos nuevos:** `functions/api/card.js` y `wrangler.toml.ejemplo` (no activo: el KV se enlaza desde el panel de Cloudflare). **Cambios mínimos:** `js/config.js` (1 línea), `admin.html`, `r/tarjeta.html` (3 líneas más un bloque de carga) y `js/extras.js` (1 línea, para `?abre=` y `?of=`).
- **Nota técnica:** la tarjeta lee el id con una petición síncrona a propósito, para que `q`, `PL` y `extras.js` no cambien. Son unos milisegundos y el navegador puede mostrar un aviso de "deprecated" en la consola; es inofensivo.

## Corrección (v20)
- **Vista previa de plantillas en `personalizar.html`:** las imágenes de fondo de las fechas especiales se pedían a `/css/assets/...` (404) porque la ruta, pasada como variable CSS, se resolvía contra la hoja de estilos y no contra la página. Ahora `js/diseno.js` entrega una ruta absoluta (1 línea en `tplHTML`). La tarjeta final ya funcionaba.

## Corrección de despliegue
- Un `wrangler.toml` activo con `pages_build_output_dir` hacía fallar `npx wrangler deploy` (comando de Workers) con "Missing entry-point". Se renombró a `wrangler.toml.ejemplo`. El proyecto debe ser Pages (ver INSTRUCCIONES, sección 8).

## Actualización de octubre de 2026
**Panel "Interacciones" y doble toque** (`js/acciones.js`, `js/doubletap.js`)
- Un solo botón arriba abre el panel con: Secreto, Soplar, Agitar, Doble toque, Música, Compartir, Guardar imagen y Modo discreto. Cada opción explica qué hace; los botones originales siguen existiendo y el panel solo los activa.
- Sonido / Mudo: se recuerda la elección (`frass_snd` en el navegador) y también silencia la canción.
- Doble toque: al tocar dos veces la tarjeta brotan frases de felicitación por ocasión. Las frases están en `WORDS` (`js/doubletap.js`); una plantilla puede traer su propia lista en `dt` dentro de `js/config.js`.

**Rendimiento de la tarjeta** (`css/carta.css`, `js/carta.js`, `r/tarjeta.html`)
- El grano del papel ahora es un mosaico PNG diminuto; antes era un filtro SVG (`feTurbulence`) con `mix-blend-mode`, la causa principal del lag al abrir el sobre.
- El parallax solo corre mientras la tarjeta se mueve (antes un bucle corría siempre) y en celular la inclinación es más suave y vuelve al centro al soltar el dedo.
- Tailwind compilado (ver "Estilos"), y confeti y Typed.js cargan con `defer`.

**Menú de Ocasiones: papelito con imagen** (`js/config.js`, `index.html`, `css/styles.css`)
- Una plantilla puede tener el campo opcional `cover:'assets/archivo.webp'`. Si lo tiene, el papelito que asoma del sobre en la miniatura muestra esa imagen; sin `cover` queda el papelito de color de siempre. Solo afecta al menú de Ocasiones, no a la carta real.
- Imagen recomendada: unos 480 px de ancho y unos 400 de alto, WebP, recortada de la parte superior del diseño (el título debe verse arriba). Regla CSS: `.mini .p.img`.

**Encabezado en celulares** (`css/hero.css`)
- Por debajo de 640 px el logo se reduce para que "Ver Ocasiones" no se corte; en pantallas muy angostas (menos de 340 px) el botón queda solo con el ícono. "Hacer la mía" y "WhatsApp" del encabezado se ocultan a propósito en celular (clase `hidden sm:inline-flex`) y también entre 640 y 899 px, porque no caben; esas acciones existen como botón principal del héroe y como botón verde flotante.

**Funciones apagadas** (`TV.FUNCIONES` en `js/config.js`)
- `redactor`, `grupo` y `voz` están en `false`. Con `grupo` apagado, `grupo.html` redirige a `index.html` (no es un error). Agrega `?dev=1` a la dirección para probar todo lo apagado.
- Los aportes de grupo se envían por WhatsApp en texto, sin pasar por el buzón cifrado; revisa eso antes de encenderlo.

## Pendientes conocidos
1. Activar Turnstile: falta `TURNSTILE_SITEKEY` en `js/config.js` y la variable `TURNSTILE_SECRET` en Cloudflare. Ya viene programado en `js/buzon.js`.
2. Regla de límite de peticiones para `/api/*` en Cloudflare, y bloqueo por IP en `admin.js`.
3. Probar el menú Compartir de WhatsApp en un iPhone.
4. Portada: Three.js, Lucide y Elfsight siguen cargando desde servidores externos y bloquean o pesan al abrir `index.html`. Pendiente alojarlos en el sitio, cargar el 3D sin bloquear y decidir qué mostrar en celulares.
5. `js/mensaje.js` usa una expresión regular (`(?<=...)`) que no funciona en iPhones con iOS anterior a 16.4: en esos equipos el mensaje de la tarjeta puede no cargar.
6. Revisar que el precio normal de la tarjeta virtual sea coherente con el del llavero (que ya la incluye).
