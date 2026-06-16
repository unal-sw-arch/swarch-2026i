db = db.getSiblingDB('menu_db');

// Equivalent to: FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
if (!db.getCollectionNames().includes("menu_items")) {
  db.createCollection("menu_items", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["categoryId", "name", "price"],
        properties: {
          categoryId: {
            bsonType: "string",
            description: "Must reference an existing menu_categories._id"
          },
          name: { bsonType: "string" },
          price: { bsonType: ["decimal", "double", "int", "long"] }
        }
      }
    }
  });
}

var platoCat = db.menu_categories.insertOne({
  restaurantId: NumberLong("1011"),
  category: "PLATO_FUERTE",
  _class: "com.clickmunch.MenuService.entity.MenuCategory"
});

var bebidaCat = db.menu_categories.insertOne({
  restaurantId: NumberLong("1011"),
  category: "BEBIDA",
  _class: "com.clickmunch.MenuService.entity.MenuCategory"
});

db.menu_items.insertMany([
  {
    categoryId: platoCat.insertedId.toString(),
    name: "Hamburguesa con Queso",
    description: "Jugosa hamburguesa de res a la parrilla con queso cheddar, lechuga, tomate y pepinillos.",
    price: Decimal128("9.99"),
    imageUrl: "https://example.com/images/hamburguesa-queso.jpg",
    availableFrom: ISODate("1970-01-01T11:00:00.000Z"),
    availableTo: ISODate("1970-01-01T22:00:00.000Z"),
    preparationMinutes: 15,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  },
  {
    categoryId: platoCat.insertedId.toString(),
    name: "Sándwich de Pollo Crujiente",
    description: "Pechuga de pollo frita con ensalada de col y mostaza de miel en pan brioche.",
    price: Decimal128("8.49"),
    imageUrl: "https://example.com/images/sandwich-pollo.jpg",
    availableFrom: ISODate("1970-01-01T11:00:00.000Z"),
    availableTo: ISODate("1970-01-01T22:00:00.000Z"),
    preparationMinutes: 12,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  },
  {
    categoryId: bebidaCat.insertedId.toString(),
    name: "Malteada de Chocolate",
    description: "Malteada espesa y cremosa de chocolate elaborada con helado de primera calidad.",
    price: Decimal128("4.99"),
    imageUrl: "https://example.com/images/malteada-chocolate.jpg",
    availableFrom: ISODate("1970-01-01T10:00:00.000Z"),
    availableTo: ISODate("1970-01-01T21:00:00.000Z"),
    preparationMinutes: 5,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  }
]);

// Seed for restaurant 1026 (Juan's Restaurant) to match order-seed.sql
var platoCat1026 = db.menu_categories.insertOne({
  restaurantId: NumberLong("1026"),
  category: "PLATO_FUERTE",
  _class: "com.clickmunch.MenuService.entity.MenuCategory"
});

var bebidaCat1026 = db.menu_categories.insertOne({
  restaurantId: NumberLong("1026"),
  category: "BEBIDA",
  _class: "com.clickmunch.MenuService.entity.MenuCategory"
});

db.menu_items.insertMany([
  {
    categoryId: platoCat1026.insertedId.toString(),
    name: "Hamburguesa con Queso",
    description: "Jugosa hamburguesa de res a la parrilla con queso cheddar, lechuga, tomate y pepinillos.",
    price: Decimal128("9.99"),
    imageUrl: "https://example.com/images/hamburguesa-queso.jpg",
    availableFrom: ISODate("1970-01-01T11:00:00.000Z"),
    availableTo: ISODate("1970-01-01T22:00:00.000Z"),
    preparationMinutes: 15,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  },
  {
    categoryId: platoCat1026.insertedId.toString(),
    name: "Sándwich de Pollo Crujiente",
    description: "Pechuga de pollo frita con ensalada de col y mostaza de miel en pan brioche.",
    price: Decimal128("8.49"),
    imageUrl: "https://example.com/images/sandwich-pollo.jpg",
    availableFrom: ISODate("1970-01-01T11:00:00.000Z"),
    availableTo: ISODate("1970-01-01T22:00:00.000Z"),
    preparationMinutes: 12,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  },
  {
    categoryId: bebidaCat1026.insertedId.toString(),
    name: "Malteada de Chocolate",
    description: "Malteada espesa y cremosa de chocolate elaborada con helado de primera calidad.",
    price: Decimal128("4.99"),
    imageUrl: "https://example.com/images/malteada-chocolate.jpg",
    availableFrom: ISODate("1970-01-01T10:00:00.000Z"),
    availableTo: ISODate("1970-01-01T21:00:00.000Z"),
    preparationMinutes: 5,
    _class: "com.clickmunch.MenuService.entity.MenuItem"
  }
]);
