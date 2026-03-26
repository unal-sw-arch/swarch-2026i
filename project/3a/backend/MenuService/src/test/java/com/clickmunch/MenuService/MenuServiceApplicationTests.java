package com.clickmunch.MenuService;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
	"spring.data.mongodb.uri=mongodb://localhost:27018/menu_db_test",
	"spring.data.mongodb.database=menu_db_test"
})
class MenuServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
