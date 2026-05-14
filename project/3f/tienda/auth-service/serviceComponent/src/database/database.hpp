#ifndef DATABASE_H
#define DATABASE_H

#include "../models/user.hpp"
#include <pqxx/pqxx>
#include <vector>
#include <optional>
#include <iostream>

class Database {
private:
    std::string conn_str = "host=auth-db port=5432 dbname=auth_db user=user_auth password=password_segura";

public:
    // 1. CREAR USUARIO (Persistente en la DB)
    bool createUser(User user) {
        try {
            pqxx::connection C(conn_str);
            pqxx::work W(C);
            
            // Usamos W.quote para evitar inyecciones SQL (seguridad SAP-grade)
            W.exec0("INSERT INTO users (username, email, password_hash, role) VALUES (" +
                   W.quote(user.username) + ", " + 
                   W.quote(user.email) + ", " + 
                   W.quote(user.password_hash) + ", " + 
                   std::to_string(static_cast<int>(user.role)) + ")");
            
            W.commit(); // Aquí es donde realmente se guarda en el disco
            return true;
        } catch (const std::exception &e) {
            std::cerr << "Error en createUser: " << e.what() << std::endl;
            return false;
        }
    }

    // 2. BUSCAR POR EMAIL (Para el Login)
    std::optional<User> findByEmail(const std::string& email) {
        try {
            pqxx::connection C(conn_str);
            pqxx::nontransaction N(C);
            pqxx::result R = N.exec("SELECT id, username, email, password_hash, role FROM users WHERE email = " + N.quote(email));

            if (R.empty()) return std::nullopt;

            User u;
            u.id = R[0][0].as<int>();
            u.username = R[0][1].as<std::string>();
            u.email = R[0][2].as<std::string>();
            u.password_hash = R[0][3].as<std::string>();
            u.role = static_cast<UserRole>(R[0][4].as<int>());
            return u;
        } catch (const std::exception &e) {
            std::cerr << "Error en findByEmail: " << e.what() << std::endl;
            return std::nullopt;
        }
    }

    // 3. ACTUALIZAR ROL (Para la función de Promoción)
    bool updateRole(int id, UserRole newRole) {
        try {
            pqxx::connection C(conn_str);
            pqxx::work W(C);
            
            pqxx::result R = W.exec("UPDATE users SET role = " + 
                                   std::to_string(static_cast<int>(newRole)) + 
                                   " WHERE id = " + std::to_string(id));
            
            W.commit();
            return R.affected_rows() > 0; // Si no encontró el ID, devuelve false
        } catch (const std::exception &e) {
            std::cerr << "Error en updateRole: " << e.what() << std::endl;
            return false;
        }
    }
};

#endif