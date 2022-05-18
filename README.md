
#### Pasos a seguir para el correcto funcionamiento del repositorio


1. Descargar el repositorio en local

2. Abrir la carpeta en Visual Studio Code

3. Ejecuta npm install

4. Ejecuta npm start

5.- Abrir el proyecto en localhost:3000 y probar diferentes usuarios en varios navegadores


### Estructura del proyecto

- #### /config
  - configuración de axios a partir del apiClient
  - configuración conexión con MonbgoDB
- #### /constants
  - carpeta dónde colocar constantes de la aplicación
- #### /helpers
  - carpeta dónde se colocan algunas utilidades de ayuda como la gestión de retorno de error o la configuración de helpers de handleBars
- #### /models
  - modelos de mongoDB
- #### /public
  - /css: carpeta dónde se genera el css en el build
  - /img: carpeta para imágenes
  - bundle.js: archivo final que compila webpack con todo el js de la aplicación
- #### /routes
  - api.js: rutas de express para usar la apiRest de conquer
  - index.js: rutas para gestionar las distintas url (páginas) del proyecto
- #### /seeds
  - creación de datos iniciales en la BD al levantar el servidor
- #### /services
  - Servicios que usa la app para comunicarse con la api
    - games.js
    - rooms.js
    - user.js
- #### /sockets
  - scripts relacionados con sockets.io
- #### /src
  - carpeta que contiene los archivos que se compilan posteriormente para obtener el build final
    - js: archivos javascript
    - sass: archivos .scss
    - views: archivos de handlebars que componen las plantillas de las vistas de la aplicación

## Documentación API Rest

Hemos usado swagger para generar la documentación de la API mediante comentarios.

Una vez levantado el proyecto poner la url http://localhost:3000/doc
