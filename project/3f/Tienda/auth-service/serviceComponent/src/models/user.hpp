#ifndef USER_H
#define USER_H

#include <string>
#include <nlohmann/json.hpp>

enum class UserRole { NORMAL = 0, ADMIN = 1 };

struct User {
    int id;
    std::string username;
    std::string email;
    std::string password_hash;
    UserRole role = UserRole::NORMAL;
};

#endif