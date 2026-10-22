/* Configuración de Tailwind 3.4 para compilar el CSS de FRASSMOTTI (reemplaza al CDN y a js/tw.js).
   Mismos valores que tenía tw.js. Revisa TODOS los html y js, así que cualquier clase nueva se incluye al volver a compilar. */
module.exports = {
  content: ["./*.html", "./r/**/*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: { accent: '#FF4D5A' },
      borderRadius: { '3xl': '24px' }
    }
  }
}
