#include "crow_all.h"
#include "database/database.hpp"
#include "controllers/authController.hpp"

int main() {
    crow::SimpleApp app;
    Database db;
    AuthController authCtrl(db);

    CROW_ROUTE(app, "/register").methods(crow::HTTPMethod::POST)
    ([&authCtrl](const crow::request& req) {
        return authCtrl.handleRegister(req);
    });

    CROW_ROUTE(app, "/login").methods(crow::HTTPMethod::POST)
    ([&authCtrl](const crow::request& req) {
        return authCtrl.handleLogin(req);
    });

    CROW_ROUTE(app, "/promote").methods(crow::HTTPMethod::POST)
    ([&authCtrl](const crow::request& req) {
        return authCtrl.handlePromotion(req);
    });

    app.port(8080).multithreaded().run();
}