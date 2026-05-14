#ifndef AUTH_CONTROLLER_H
#define AUTH_CONTROLLER_H

#include "crow_all.h"
#include "../database/database.hpp"
#include "../security/hasher.hpp"
#include <nlohmann/json.hpp>
#include "../security/tokenService.hpp"

class AuthController {
private:
    Database& db;

public:
    AuthController(Database& database) : db(database) {}

    crow::response handleRegister(const crow::request& req) {
        auto personInput = nlohmann::json::parse(req.body);
        
        if (personInput["password"] != personInput["confirm_password"]) {
            return crow::response(400, "Las contraseñas no coinciden");
        }

        User newUser;
        newUser.username = personInput["username"];
        newUser.email = personInput["email"];
        newUser.password_hash = Hasher::hashPassword(personInput["password"]);

        if (db.findByEmail(newUser.email)) {
            return crow::response(409, "El correo ya está registrado");
        }

        if (db.createUser(newUser)) {
            return crow::response(201, "Usuario creado");
        }
        return crow::response(500, "Error de DB al crear usuario");
    }

    crow::response handleLogin(const crow::request& req) {
        auto personInput = nlohmann::json::parse(req.body);
        auto user = db.findByEmail(personInput["email"]);

        if (user && Hasher::verifyPassword(personInput["password"], user->password_hash)) {
            
            std::string token = TokenService::generateToken(user->id, user->role);
            
            nlohmann::json responseBody;
            responseBody["token"] = token;
            responseBody["message"] = "Login exitoso";

            return crow::response(200, responseBody.dump());
        }
        
        return crow::response(401, "Correo o contraseña incorrectos");
    }

    crow::response handlePromotion(const crow::request& req) {
        auto authHeader = req.get_header_value("Authorization");
        if (authHeader.empty()) {
            return crow::response(401, "Acceso denegado: No se proporcionó un token");
        }

        std::string token = authHeader.substr(7); 
        UserRole requesterRole = TokenService::verifyAndGetRole(token);

        if (requesterRole != UserRole::ADMIN) {
            return crow::response(403, "Error: Solo los administradores pueden otorgar permisos");
        }

        auto personInput = nlohmann::json::parse(req.body);
        int targetUserId = personInput["target_user_id"];

        if (db.updateRole(targetUserId, UserRole::ADMIN)) {
            return crow::response(200, "Éxito: El usuario ha sido ascendido a Administrador");
        }
        
        return crow::response(404, "Error: El usuario que intentas ascender no existe");
    }
};

#endif