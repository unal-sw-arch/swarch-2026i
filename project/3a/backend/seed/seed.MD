al ejecutar:

**docker compose up --build**
no se crean datos de prueba

al ejecutar:

**docker compose -f docker-compose.yml -f docker-compose.seed.yml up --build**
se crean datos de prueba


esto con el objetivo de no dejar datos de prueba regados en el código fuente


se agregan los datos a cualquier a un archivo en /seed, luego se agrega la ubicación de esos archivos .sql o .js a:

../docker-compose.seed.yml

siguiendo la forma de como están estructurados los que ya están, con ia es fácil para agregarlos


docker compose up --build

docker compose -f docker-compose.yml -f docker-compose.seed.yml up --build