# Next Hotel Project

Reproducción virtual de las diferentes sedes de NEXT que podremos recorrer con nuestro avatar, pudiendo conocer el ambiente de trabajo y conectar con otros compañeros.

##### Include models:
Para incluir un nuevo modelo de planta, simplemente hay exportar nuestro modelo en blender como .obj dentro de la carpeta "models" del proyecto y añadir en la variable "plantas" de main.js un nuevo elemento al array con el mismo nombre que tiene el archivo .obj que hemos exportado.

##### transparent PNG:
Si quieres usar como textura un png con transparencia, debes asignar a ese objeto un material cuyo nombre empiece con la palabra "transparent", y luego aplicarle la textura png. de esta manera, al importar en modelo en .obj, esas transparencias se procesaran correctamente.

##### Technologies:
- [Three.js](https://threejs.org/) (WebGL)
- [Blender](https://blender.org/) for Modeling.
##### Libraries:
- [Tween](https://github.com/tweenjs/tween.js/) for animations.