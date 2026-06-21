package com.clickmunch.MenuService.config;

import com.clickmunch.MenuService.entity.Category;
import com.clickmunch.MenuService.entity.MenuCategory;
import com.clickmunch.MenuService.entity.MenuItem;
import com.clickmunch.MenuService.repository.MenuCategoryRepository;
import com.clickmunch.MenuService.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds demo menu data for local/testing environments.
 *
 * <p>Disabled by default. It only runs when {@code app.seed.enabled=true}
 * (env {@code APP_SEED_ENABLED=true}), which the docker-compose dev stack sets.
 * Keeping it opt-in means it never runs during unit tests or in production, and
 * the per-restaurant existence guards below make re-runs idempotent.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class MenuDataInitializer implements CommandLineRunner {

    private final MenuCategoryRepository categoryRepo;
    private final MenuItemRepository itemRepo;

    public MenuDataInitializer(MenuCategoryRepository categoryRepo, MenuItemRepository itemRepo) {
        this.categoryRepo = categoryRepo;
        this.itemRepo = itemRepo;
    }

    @Override
    public void run(String... args) {
        seedOriginal();
        seedExpansion();
    }

    private void seedOriginal() {
        if (!categoryRepo.findByRestaurantId(1001L).isEmpty()) return;

        seed(1001L, Category.PLATO_FUERTE, List.of(
            item("Lomo Saltado", "Carne salteada con tomate, cebolla y papas crocantes.", new BigDecimal("29900"),
                "https://images.unsplash.com/photo-1604908176997-431f81918a93?w=900&h=600&fit=crop&auto=format"),
            item("Ceviche Clasico", "Pescado fresco marinado en limon con aji y cilantro.", new BigDecimal("27500"),
                "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&h=600&fit=crop&auto=format"),
            item("Aji de Gallina", "Pollo deshilachado en salsa cremosa de aji amarillo.", new BigDecimal("25900"),
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1002L, Category.PLATO_FUERTE, List.of(
            item("Arroz Oriental de Pollo", "Arroz salteado al wok con vegetales y salsa de soya.", new BigDecimal("24000"),
                "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&h=600&fit=crop&auto=format"),
            item("Pollo Agridulce", "Trozos de pollo crujiente en salsa agridulce.", new BigDecimal("26500"),
                "https://images.unsplash.com/photo-1604908554167-6ed6a6c9f839?w=900&h=600&fit=crop&auto=format"),
            item("Ramen Clasico", "Caldo de cerdo con fideos, huevo y chashu.", new BigDecimal("28000"),
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1003L, Category.PLATO_FUERTE, List.of(
            item("Burrito Carnal", "Tortilla rellena de carne, frijol, guacamole y queso.", new BigDecimal("22900"),
                "https://images.unsplash.com/photo-1565299585323-38174c4a6c4a?w=900&h=600&fit=crop&auto=format"),
            item("Nachos Supreme", "Nachos con carne, pico de gallo, crema y queso.", new BigDecimal("21500"),
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&h=600&fit=crop&auto=format"),
            item("Tacos de Barbacoa", "Tres tacos de barbacoa con cebolla y cilantro.", new BigDecimal("19900"),
                "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1004L, Category.PLATO_FUERTE, List.of(
            item("Salmón Nigiri (8 pzas)", "Nigiri de salmon fresco sobre arroz de sushi.", new BigDecimal("32000"),
                "https://images.unsplash.com/photo-1553621042-f6e147245754?w=900&h=600&fit=crop&auto=format"),
            item("Roll California", "Roll de pepino, aguacate y cangrejo con semillas de sesamo.", new BigDecimal("27500"),
                "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=900&h=600&fit=crop&auto=format"),
            item("Miso Ramen", "Sopa de miso con tofu, algas y fideos.", new BigDecimal("23000"),
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1005L, Category.PLATO_FUERTE, List.of(
            item("Costillas BBQ", "Costillas de cerdo en salsa BBQ ahumada con papas.", new BigDecimal("42000"),
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&h=600&fit=crop&auto=format"),
            item("Picana de Res", "Corte de res a la parrilla con chimichurri y ensalada.", new BigDecimal("48000"),
                "https://images.unsplash.com/photo-1558030006-450675393462?w=900&h=600&fit=crop&auto=format"),
            item("Chorizo Argentino", "Chorizo artesanal a la parrilla con pan y aji.", new BigDecimal("22000"),
                "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1006L, Category.BEBIDA, List.of(
            item("Cappuccino de Especialidad", "Espresso doble con leche vaporizada y arte latte.", new BigDecimal("12000"),
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=600&fit=crop&auto=format"),
            item("Tostada Francesa con Frutas", "Pan brioche tostado con frutas frescas y miel.", new BigDecimal("18500"),
                "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&h=600&fit=crop&auto=format"),
            item("Cold Brew", "Cafe de extraccion lenta servido frio con hielo.", new BigDecimal("10000"),
                "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1007L, Category.POSTRE, List.of(
            item("Torta de Chocolate", "Bizcocho humedo de chocolate con ganache y fresas.", new BigDecimal("18000"),
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&h=600&fit=crop&auto=format"),
            item("Cheesecake de Maracuya", "Base de galleta con crema de maracuya y coulis.", new BigDecimal("16500"),
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900&h=600&fit=crop&auto=format"),
            item("Macarons Surtidos (6 pzas)", "Macarons franceses en sabores variados.", new BigDecimal("22000"),
                "https://images.unsplash.com/photo-1558326567-98ae2405596b?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1008L, Category.PLATO_FUERTE, List.of(
            item("Smash Burger Doble", "Doble carne aplastada, queso americano, pepinillos y salsa especial.", new BigDecimal("28000"),
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&h=600&fit=crop&auto=format"),
            item("Crispy Chicken Burger", "Filete de pollo crocante con col morada y mayo de chipotle.", new BigDecimal("25000"),
                "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=900&h=600&fit=crop&auto=format"),
            item("Papas Gajo con Dip", "Papas en gajo al horno con dip de queso cheddar.", new BigDecimal("12000"),
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1009L, Category.PLATO_FUERTE, List.of(
            item("Spaghetti Carbonara", "Pasta con panceta, huevo, parmesano y pimienta negra.", new BigDecimal("29000"),
                "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=900&h=600&fit=crop&auto=format"),
            item("Lasagna Bolognesa", "Capas de pasta con ragu de carne y bechamel gratinada.", new BigDecimal("32000"),
                "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=900&h=600&fit=crop&auto=format"),
            item("Risotto de Funghi", "Arroz arborio cremoso con hongos porcini y parmesano.", new BigDecimal("31000"),
                "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=900&h=600&fit=crop&auto=format")
        ));

        seed(1010L, Category.PLATO_FUERTE, List.of(
            item("Pollo Asado Entero", "Pollo a la brasa con papas amarillas y aji verde.", new BigDecimal("38000"),
                "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900&h=600&fit=crop&auto=format"),
            item("Medio Pollo con Ensalada", "Media presa de pollo asado con ensalada fresca.", new BigDecimal("22000"),
                "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=900&h=600&fit=crop&auto=format"),
            item("Alitas Picantes (10 pzas)", "Alitas de pollo marinadas en salsa picante con ranch.", new BigDecimal("24000"),
                "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=900&h=600&fit=crop&auto=format")
        ));
    }

    private void seedExpansion() {
        if (!categoryRepo.findByRestaurantId(1019L).isEmpty()) return;

        // 1019 - Tickets (Tapas, Barcelona)
        seed(1019L, Category.ENTRADA, List.of(
            item("Oliva esferica con vermut", "La celebre oliva esferica de Tickets con vermut rojo y anchoa.", new BigDecimal("22"),
                "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=900&h=600&fit=crop&auto=format"),
            item("Bunuelos de bacalao", "Bunuelos dorados de bacalao desalado con alioli de ajo negro.", new BigDecimal("16"),
                "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=900&h=600&fit=crop&auto=format"),
            item("Bravas innovadas", "Patatas con salsa roja picante y alioli ahumado al momento.", new BigDecimal("12"),
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&h=600&fit=crop&auto=format")
        ));

        // 1020 - Sala de Despiece (Espanola, Madrid)
        seed(1020L, Category.PLATO_FUERTE, List.of(
            item("Huevo frito sobre rabo de toro", "Huevo en aceite de arbequina sobre rabo de toro estofado.", new BigDecimal("18"),
                "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=900&h=600&fit=crop&auto=format"),
            item("Steak tartare de Angus", "Carne cruda de angus con mostaza antigua, alcaparras y tosta.", new BigDecimal("22"),
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=600&fit=crop&auto=format"),
            item("Queso payoyo con trufa", "Queso artesanal andaluz con laminas de trufa negra y miel de romero.", new BigDecimal("14"),
                "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=900&h=600&fit=crop&auto=format")
        ));

        // 1021 - Zuma (Japonesa, Miami)
        seed(1021L, Category.PLATO_FUERTE, List.of(
            item("Robata de Wagyu", "Costillas de wagyu a la brasa con tare de miso y citricos.", new BigDecimal("42"),
                "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=900&h=600&fit=crop&auto=format"),
            item("Tiradito de Yellowtail", "Pez limon fresco en ponzu con jalapeño y aceite de trufa.", new BigDecimal("28"),
                "https://images.unsplash.com/photo-1553621042-f6e147245754?w=900&h=600&fit=crop&auto=format"),
            item("Gyoza de Cangrejo (6 pzas)", "Dumplings al vapor rellenos de cangrejo real con ponzu.", new BigDecimal("22"),
                "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=900&h=600&fit=crop&auto=format")
        ));

        // 1022 - Cosme (Mexicana, New York)
        seed(1022L, Category.PLATO_FUERTE, List.of(
            item("Duck Carnitas", "Pato confitado deshebrado con habanero, pickles y tortilla de maiz.", new BigDecimal("32"),
                "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=900&h=600&fit=crop&auto=format"),
            item("Shrimp Aguachile", "Camarones en aguachile verde intenso con pepino y cebolla morada.", new BigDecimal("26"),
                "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&h=600&fit=crop&auto=format"),
            item("Husk Tamale", "Tamal de elote tierno con queso Oaxaca, hongos silvestres y epazote.", new BigDecimal("20"),
                "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900&h=600&fit=crop&auto=format")
        ));

        // 1023 - Mocoto (Brasilena, Sao Paulo)
        seed(1023L, Category.PLATO_FUERTE, List.of(
            item("Mocofava", "Guiso nordestino de patas de res con fava, embutidos y farofa.", new BigDecimal("55"),
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&h=600&fit=crop&auto=format"),
            item("Baiao de Dois", "Arroz con frijol, queso coalho, charque y manteiga de garrafa.", new BigDecimal("48"),
                "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=900&h=600&fit=crop&auto=format"),
            item("Caldo de Mocoto", "Caldo nutritivo de pata de res con jengibre, verduras y limao.", new BigDecimal("42"),
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&h=600&fit=crop&auto=format")
        ));

        // 1024 - Brasserie Flo (Francesa, Paris)
        seed(1024L, Category.PLATO_FUERTE, List.of(
            item("Escargots de Bourgogne", "6 caracoles de Borgona con mantequilla de ajo, perejil y pan.", new BigDecimal("28"),
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=600&fit=crop&auto=format"),
            item("Steak frites maison", "Entrecote de res con papas fritas y beurre maitre d hotel.", new BigDecimal("32"),
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=600&fit=crop&auto=format"),
            item("Creme brulee classique", "Clasico postre frances con crema de vainilla de Madagascar y caramelo.", new BigDecimal("14"),
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900&h=600&fit=crop&auto=format")
        ));

        // 1025 - Narisawa (Japonesa, Tokyo)
        seed(1025L, Category.PLATO_FUERTE, List.of(
            item("Satoyama Scenery", "Composicion de verduras de temporada del campo de montana japones.", new BigDecimal("8500"),
                "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&h=600&fit=crop&auto=format"),
            item("Charcoal Bread", "Pan de carbon vegetal artesanal con mantequilla de trufa negra.", new BigDecimal("3200"),
                "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&h=600&fit=crop&auto=format"),
            item("Forest Lamb", "Cordero de Hokkaido con tierra comestible de champinones y hierbas.", new BigDecimal("12000"),
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=600&fit=crop&auto=format")
        ));
    }

    private void seed(Long restaurantId, Category category, List<MenuItem> items) {
        MenuCategory cat = new MenuCategory();
        cat.setRestaurantId(restaurantId);
        cat.setCategory(category);
        MenuCategory saved = categoryRepo.save(cat);
        items.forEach(i -> {
            i.setCategoryId(saved.getId());
            itemRepo.save(i);
        });
    }

    private MenuItem item(String name, String description, BigDecimal price, String imageUrl) {
        MenuItem m = new MenuItem();
        m.setName(name);
        m.setDescription(description);
        m.setPrice(price);
        m.setImageUrl(imageUrl);
        return m;
    }
}
