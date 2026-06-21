#ifndef DATABASE_H
#define DATABASE_H

#include "../models/user.hpp"
#include <pqxx/pqxx>
#include <vector>
#include <optional>
#include <iostream>
#include <cstdlib>

class Database {
private:
    std::string buildConnStr() {
        const char* host     = std::getenv("DB_HOST");
        const char* port     = std::getenv("DB_PORT");
        const char* dbname   = std::getenv("DB_NAME");
        const char* user     = std::getenv("DB_USER");
        const char* password = std::getenv("DB_PASSWORD");

        return std::string("host=")     + (host     ? host     : "auth-db")
             + " port="                 + (port     ? port     : "5432")
             + " dbname="               + (dbname   ? dbname   : "auth_db")
             + " user="                 + (user     ? user     : "user_auth")
             + " password="             + (password ? password : "password_segura");
    }

public:
    bool createUser(User user) {
        try {
            pqxx::connection C(buildConnStr());
            pqxx::work W(C);
            W.exec0("INSERT INTO users (username, email, password_hash, role) VALUES (" +
                   W.quote(user.username) + ", " +
                   W.quote(user.email) + ", " +
                   W.quote(user.password_hash) + ", " +
                   std::to_string(static_cast<int>(user.role)) + ")");
            W.commit();
            return true;
        } catch (const std::exception &e) {
            std::cerr << "Error en createUser: " << e.what() << std::endl;
            return false;
        }
    }

    std::optional<User> findByEmail(const std::string& email) {
        try {
            pqxx::connection C(buildConnStr());
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

    bool updateRole(int id, UserRole newRole) {
        try {
            pqxx::connection C(buildConnStr());
            pqxx::work W(C);
            pqxx::result R = W.exec("UPDATE users SET role = " +
                                   std::to_string(static_cast<int>(newRole)) +
                                   " WHERE id = " + std::to_string(id));
            W.commit();
            return R.affected_rows() > 0;
        } catch (const std::exception &e) {
            std::cerr << "Error en updateRole: " << e.what() << std::endl;
            return false;
        }
    }
};

#endif