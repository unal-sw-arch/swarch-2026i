db = db.getSiblingDB('tracking_db');

db.createCollection('activities');

// Insert the 12 seed events
db.activities.insertMany([
    { orderId: "1", eventType: "ORDER_CREATED", timestamp: new Date(Date.now() - 3600000).toISOString(), details: { status: "CREATED" } },
    { orderId: "1", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 3500000).toISOString(), details: { status: "IN_PREPARATION" } },
    { orderId: "1", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 3400000).toISOString(), details: { status: "READY" } },
    { orderId: "1", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 3300000).toISOString(), details: { status: "DELIVERED" } },

    { orderId: "2", eventType: "ORDER_CREATED", timestamp: new Date(Date.now() - 7200000).toISOString(), details: { status: "CREATED" } },
    { orderId: "2", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 7100000).toISOString(), details: { status: "IN_PREPARATION" } },
    { orderId: "2", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 7000000).toISOString(), details: { status: "READY" } },
    { orderId: "2", eventType: "ORDER_CANCELLED", timestamp: new Date(Date.now() - 6900000).toISOString(), details: { status: "CANCELLED" } },

    { orderId: "3", eventType: "ORDER_CREATED", timestamp: new Date(Date.now() - 10800000).toISOString(), details: { status: "CREATED" } },
    { orderId: "3", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 10700000).toISOString(), details: { status: "IN_PREPARATION" } },
    { orderId: "3", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 10600000).toISOString(), details: { status: "READY" } },
    { orderId: "3", eventType: "ORDER_STATUS_CHANGED", timestamp: new Date(Date.now() - 10500000).toISOString(), details: { status: "DELIVERED" } },
]);

print("MongoDB seed logic execution completed.");
