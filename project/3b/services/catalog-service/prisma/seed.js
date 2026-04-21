const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: 'Sabor Andino',
      isOpen: true,
      menus: {
        create: {
          id: 20,
          items: {
            create: [
              {
                id: 101,
                name: 'Bandeja Paisa',
                description: 'Plato tradicional',
                price: 30000,
                isAvailable: true,
              },
              {
                id: 102,
                name: 'Ajiaco',
                description: 'Sopa tradicional',
                price: 22000,
                isAvailable: true,
              }
            ]
          }
        }
      }
    }
  });

  console.log('✅ Datos de prueba insertados con éxito:', restaurant.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
