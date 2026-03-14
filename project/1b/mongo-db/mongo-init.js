db = db.getSiblingDB('tracking_context');

db.createUser({
  user: "tracking_service_user",
  pwd: "tracking_password_2026",
  roles: [{ role: "readWrite", db: "tracking_context" }]
});

db.createCollection('activity_events');

db.activity_events.createIndex({ "orderId": 1 });
db.activity_events.createIndex({ "restaurantId": 1 });
db.activity_events.createIndex({ "eventType": 1 });
db.activity_events.createIndex({ "timestamp": -1 }); 

db.activity_events.insertMany([
  {
    "_id": "evt_0001",
    "eventType": "RESTAURANT_CREATED",
    "entityType": "RESTAURANT",
    "entityId": "1",
    "restaurantId": "1",
    "timestamp": new Date(new Date().getTime() - 24 * 60 * 60000), // Hace 1 día
    "sourceService": "order-service",
    "payload": { "name": "Burger Joint", "status": "ACTIVE" }
  },
  {
    "_id": "evt_0002",
    "eventType": "MENU_CREATED",
    "entityType": "MENU",
    "entityId": "10",
    "restaurantId": "1",
    "timestamp": new Date(new Date().getTime() - 23 * 60 * 60000),
    "sourceService": "order-service",
    "payload": { "menuName": "Menú Principal", "status": "ACTIVE" }
  },
  {
    "_id": "evt_0003",
    "eventType": "MENU_ITEM_CREATED",
    "entityType": "MENU_ITEM",
    "entityId": "101",
    "restaurantId": "1",
    "timestamp": new Date(new Date().getTime() - 22 * 60 * 60000),
    "sourceService": "order-service",
    "payload": { "itemName": "Hamburguesa Sencilla", "price": 15000 }
  },
  {
    "_id": "evt_0004",
    "eventType": "MENU_ITEM_UPDATED",
    "entityType": "MENU_ITEM",
    "entityId": "101",
    "restaurantId": "1",
    "timestamp": new Date(new Date().getTime() - 20 * 60 * 60000),
    "sourceService": "order-service",
    "payload": { "itemName": "Hamburguesa Sencilla", "previousPrice": 15000, "newPrice": 18000 }
  },
  
  {
    "_id": "evt_0005",
    "eventType": "ORDER_CREATED",
    "entityType": "ORDER",
    "entityId": "5001",
    "restaurantId": "1",
    "orderId": "5001",
    "timestamp": new Date(new Date().getTime() - 120000), // Hace 120 min
    "sourceService": "order-service",
    "payload": { "customerName": "Laura", "totalAmount": 36000, "status": "CREATED" }
  },
  {
    "_id": "evt_0006",
    "eventType": "ORDER_STATUS_CHANGED",
    "entityType": "ORDER",
    "entityId": "5001",
    "restaurantId": "1",
    "orderId": "5001",
    "timestamp": new Date(new Date().getTime() - 110000),
    "sourceService": "order-service",
    "payload": { "customerName": "Laura", "previousStatus": "CREATED", "newStatus": "PREPARING" }
  },
  {
    "_id": "evt_0007",
    "eventType": "ORDER_STATUS_CHANGED",
    "entityType": "ORDER",
    "entityId": "5001",
    "restaurantId": "1",
    "orderId": "5001",
    "timestamp": new Date(new Date().getTime() - 90000),
    "sourceService": "order-service",
    "payload": { "customerName": "Laura", "previousStatus": "PREPARING", "newStatus": "READY" }
  },
  {
    "_id": "evt_0008",
    "eventType": "ORDER_STATUS_CHANGED",
    "entityType": "ORDER",
    "entityId": "5001",
    "restaurantId": "1",
    "orderId": "5001",
    "timestamp": new Date(new Date().getTime() - 85000),
    "sourceService": "order-service",
    "payload": { "customerName": "Laura", "previousStatus": "READY", "newStatus": "DELIVERED" }
  },

  {
    "_id": "evt_0009",
    "eventType": "ORDER_CREATED",
    "entityType": "ORDER",
    "entityId": "5002",
    "restaurantId": "1",
    "orderId": "5002",
    "timestamp": new Date(new Date().getTime() - 60000), // Hace 60 min
    "sourceService": "order-service",
    "payload": { "customerName": "Carlos", "totalAmount": 18000, "status": "CREATED" }
  },
  {
    "_id": "evt_0010",
    "eventType": "ORDER_CANCELLED",
    "entityType": "ORDER",
    "entityId": "5002",
    "restaurantId": "1",
    "orderId": "5002",
    "timestamp": new Date(new Date().getTime() - 55000),
    "sourceService": "order-service",
    "payload": { "previousStatus": "CREATED", "newStatus": "CANCELLED", "reason": "Cliente no respondió" }
  },

  {
    "_id": "evt_0011",
    "eventType": "ORDER_CREATED",
    "entityType": "ORDER",
    "entityId": "5003",
    "restaurantId": "1",
    "orderId": "5003",
    "timestamp": new Date(new Date().getTime() - 15000), // Hace 15 min
    "sourceService": "order-service",
    "payload": { "customerName": "Andrés", "totalAmount": 54000, "status": "CREATED" }
  },
  {
    "_id": "evt_0012",
    "eventType": "ORDER_STATUS_CHANGED",
    "entityType": "ORDER",
    "entityId": "5003",
    "restaurantId": "1",
    "orderId": "5003",
    "timestamp": new Date(new Date().getTime() - 5000), // Hace 5 min
    "sourceService": "order-service",
    "payload": { "customerName": "Andrés", "previousStatus": "CREATED", "newStatus": "PREPARING" }
  }
]);