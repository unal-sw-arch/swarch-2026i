Planio es una aplicación web social para familias, amistades y grupos pequeños que
quieren organizar su vida diaria en un solo lugar. Permite crear salas compartidas
donde los miembros pueden gestionar tareas tipo Kanban (TODO / DONE), rastrear
hábitos diarios grupales y ver en tiempo real quién cumplió y quién no.
Completar tareas y hábitos genera monedas, las cuales sirven para personalizar avatares y salas.

Sigue una arquitectura de microservicios.



Cada servicio encapsula una responsabilidad bien definida:
Auth Service (Externo): gestiona autenticación y autorización de usuarios
Activity Service: administra salas, tareas y hábitos
Audit Service: registra eventos y acciones del sistema
Notification Service: maneja notificaciones en tiempo real
Personalization Service: gestiona preferencias y personalización del usuario

El sistema incluye un API Gateway, que actúa como punto único de entrada para los clientes. Este componente se encarga de enrutar las solicitudes hacia los servicios correspondientes y centralizar la comunicación.
La comunicación entre componentes se basa principalmente en protocolos HTTP, utilizando:
APIs REST para interacciones síncronas (request-response)
WebSocket para comunicación bidireccional en tiempo real

Tambien esta todo orientado a dockerizacion para que sea facil desplegar.
