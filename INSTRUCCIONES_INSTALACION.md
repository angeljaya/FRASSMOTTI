# FRASSMOTTI: instrucciones de instalación

## 1. Imágenes que debes colocar (carpeta `assets/`)
- **Tu QR de Yape:** `assets/qr-pago.png` (PNG cuadrado, mínimo 600 px). Aparece en el pago y el cliente puede descargarlo. Si falta, el checkout muestra un aviso con enlace a tu WhatsApp.
- **12 imágenes de fechas especiales** directamente en `assets/` (formato .jpg, 800x600 px, menos de 200 KB):

| Fecha | Archivos |
|---|---|
| Día de la Mujer Boliviana | `mujer-boliviana-1.jpg`, `-2.jpg`, `-3.jpg` |
| Halloween | `halloween-1.jpg`, `-2.jpg`, `-3.jpg` |
| Todos los Santos y Difuntos | `difuntos-1.jpg`, `-2.jpg`, `-3.jpg` |
| Navidad | `navidad-1.jpg`, `-2.jpg`, `-3.jpg` |

## 2. Qué se muestra al cliente (archivo `js/config.js`)
- Fechas especiales: habilitadas (Día de la Mujer, Halloween, Todos los Santos, Navidad). Para ocultar una, agrega `activo:false` a esa plantilla en `js/config.js`.
- Funciones: `TV.FUNCIONES={redactor:false,grupo:false,voz:false}`. Cambia a `true` lo que quieras mostrar.
- Edición física (llaveros, collares, manillas): lista `TV.FISICOS`. Puedes agregar `precio:25` para mostrar "Desde 25 Bs" o `activo:false` para ocultar uno.
- Para probar lo oculto, agrega `?dev=1` a la dirección (solo para pruebas).
- Número de WhatsApp y precio: al inicio de `config.js` (`WHATSAPP`, `PRECIO`).

## 3. Probar en tu computadora
1. Abre una terminal dentro de la carpeta del proyecto.
2. Ejecuta `python3 -m http.server 8000` (en Windows: `python -m http.server 8000`).
3. Abre `http://localhost:8000/?dev=1`.

## 4. Subir a Cloudflare Pages
- **Con Git:** `git add .`, `git commit -m "frassmotti"`, `git push`. Cloudflare publica solo.
- **Con terminal:** `npx wrangler pages deploy . --project-name frassmotti`.
- **Arrastrando la carpeta:** Cloudflare Pages > tu proyecto > Create deployment > sube la carpeta completa (válido con `REQUIRE_PAYMENT:false`).
Luego abre tu web con Ctrl+F5.

## 5. Cómo llega el pedido con el comprobante
WhatsApp no permite adjuntar archivos desde un enlace, así que:
- **En celular compatible:** al enviar, se abre el menú Compartir con el texto del pedido y la captura juntos. El cliente elige WhatsApp y el contacto FRASSMOTTI.
- **En computadora u otro equipo:** se abre el chat con el texto del pedido y el cliente adjunta la captura manualmente.
El checkout no deja enviar sin captura. Foto y nota de voz también se envían por el chat.

## 6. Descargar la tarjeta terminada (solo tú)
1. En Cloudflare Pages > Settings > Variables and Secrets debe existir `ADMIN_PIN` (la misma que ya usas para firmar). Vuelve a desplegar con `npx wrangler pages deploy . --project-name frassmotti` o con Git (arrastrar y soltar NO ejecuta Functions).
2. Abre `/admin.html`, pega el pedido y sube la foto del cliente (Paso 2).
3. En **Paso 4** escribe tu PIN, elige la calidad y toca PNG, JPG o PDF.
Si ves "Falta la función /api/admin", el despliegue no incluyó `functions/`. En `localhost` no pide PIN.

## 7. Tutorial "paso a paso" (index.html)
- Se ve solo, sin configurar nada. Está debajo de la sección "Edición física".
- **Tiempo de entrega:** en `js/config.js` busca `TV.TUTORIAL` y escribe, por ejemplo, `entrega:'3 a 5 días hábiles'`. Aparece en el paso 7. Déjalo vacío si prefieres no prometer plazos.
- **Ocultarlo:** `TV.TUTORIAL={activo:false,...}`.
- **Cambiar textos:** abre `js/tutorial.js` y edita la lista `PASOS` (cada paso tiene `t` título, `feel` frase emocional, `p` explicación y `tip` consejo).
- **Revisa que los pasos 5 a 7 coincidan con tu forma real de trabajar** (por ejemplo, cómo coordinas la entrega a domicilio) y ajústalos si cambia.
- Probar en tu computadora: `python3 -m http.server 8000` y abre `http://localhost:8000/#tutorial`.

## 8. Links cortos con KV (obligatorio para el link `?id=`)
**Importante:** el proyecto debe ser de tipo **Pages** (Workers & Pages > Create application > pestaña Pages > Connect to Git). Pages no tiene "Deploy command": con "Build command" vacío y "Build output directory" en `/` basta, y la carpeta `functions/` se publica sola. **No uses `npx wrangler deploy`**: es para Workers y falla con "Missing entry-point to Worker script".
1. **Crear el KV** (una vez): en Cloudflare > Storage & Databases > KV > Create, con el nombre `CARDS` (o `npx wrangler kv namespace create CARDS`).
2. **Enlazarlo:** tu proyecto Pages > Settings > Functions (Bindings) > KV namespace bindings > Add: variable `CARDS`, namespace `CARDS`. Hazlo en Production (y en Preview si pruebas ahí).
3. **Variables:** en Settings > Variables and Secrets deben existir `ADMIN_PIN` y `SIGNING_SECRET` (tipo Secret).
4. **Redesplegar:** haz un nuevo commit o usa "Retry deployment".
5. **Usar:** en `admin.html` pega el pedido, escribe tu PIN y toca generar. El link sale como `.../r/tarjeta.html?id=AbC12xYz`: ese es el que conviertes en QR.
- **Si ves "No se pudo guardar en KV":** revisa que `CARDS` esté enlazado y que `ADMIN_PIN` exista. Mientras tanto el sistema te da el link largo.
- **Config por archivo (opcional):** `wrangler.toml.ejemplo` explica cómo hacerlo, pero no es necesario.
- **Probar en tu computadora:** `npx wrangler pages dev .`
