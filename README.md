```
● Team :
```
```
● Full names:
○ Manuel Alejandro Navas Bohorquez
○ German Camilo Bernal Ladino
○ Edwin Felipe Pinilla Peralta
○ Juan David Rivera Buitrago
○ Obed Felipe Espinosa Angarita
```
```
● Software System:
○ Name: DELIUNAL
○ logo: <img width="2117" height="1849" alt="LOGO FORMATO ESCALA 500x500px" src="https://github.com/user-attachments/assets/c6e77041-fc53-41b5-a0ae-87a3ca69d4d5" />

○ Description: This project focuses on creating a delivery platform where there
is two main users first restaurants can publish their menus, and items with its
respective prices, descriptions and other information, and second one is the
customer which can select their preferred item or items offered in the app,
place the order requesting this items and do the corresponding followup
```
```
● Architectural Structures:
○ Component-and Connector (C&C) Structure:
■ C&C View: ![4097ff58-1e23-493c-a4fb-0826dbd1d105](https://github.com/user-attachments/assets/8d82db71-b9ad-4df9-b28e-22b3763c074c)

```
```
■ Description of architectural styles used:

The diagram shows a layered architecture combined with a microservices-oriented style.
The system is organized into three clear layers: a presentation layer, a logic layer, and a
data layer. This separation improves maintainability by assigning a specific responsibility to


each layer. at the same time, the logic layer is split into two independent services: order
Service and Tracking Service. This reflects a microservices or service-based architecture,
where each service is responsible for a specific business capability. the diagram also
suggests a Domain-Driven Design (DDD) influence, since each service is associated with a
bounded context: Order Management and Activity Tracking.the data design follows a
polyglot persistence approach. the Order Service uses PostgreSQL, a relational database
suited for transactional business data, while the Tracking Service uses MongoDB, a
document database better suited for logs, trace events, and operational history.In addition,
the system is deployed in a local Docker Compose environment, which indicates a
containerized architectural approach for development and integration.
```
# ■ Description of architectural elements and relations.

The main architectural elements are:

```
● Web App (React):
This is the presentation component used by users to create orders, view orders, and
check tracking history.
● Order Service (Spring Boot):
This service belongs to the Order Management bounded context. It is responsible
for creating orders, updating order status, querying orders, and applying business
rules.
● Tracking Service (Python + Django):
This service belongs to the Activity Tracking bounded context. It stores activity
events, exposes trace history, and records operational actions.
● PostgreSQL:
This is the relational data store for core business entities such as orders ,
order_items , customers , and statuses.
● MongoDB:
This is the document data store for activity_logs , trace_events , and
```
## operational_history.

The relations in the diagram are expressed through connectors:

```
● The Web App communicates with both backend services through REST
HTTP/JSON connectors. These are synchronous interactions, as indicated by the
solid lines.
● The Order Service communicates with the Tracking Service through an internal
HTTP POST connector. This relation is shown as an internal service integration,
represented by the dashed line.
● The Order Service connects to PostgreSQL through JPA/JDBC , which defines how
it persists and retrieves relational data.
● The Tracking Service connects to MongoDB through a Mongo Client / ODM , which
supports document-oriented storage and retrieval.
```


