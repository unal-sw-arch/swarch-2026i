#ifndef HASHER_H
#define HASHER_H

#include <string>

// Le decimos a C++ que estas funciones son de C
extern "C" {
    #include "bcrypt.h"
}

class Hasher {
public:
    static std::string hashPassword(const std::string& password) {
        char salt[BCRYPT_HASHSIZE];
        char hash[BCRYPT_HASHSIZE];
        
        // Generamos un salt con costo 12 (el estándar actual)
        bcrypt_gensalt(12, salt);
        bcrypt_hashpw(password.c_str(), salt, hash);
        
        return std::string(hash);
    }

    static bool verifyPassword(const std::string& password, const std::string& hashFromDb) {
        // bcrypt_checkpw devuelve 0 si coinciden
        return (bcrypt_checkpw(password.c_str(), hashFromDb.c_str()) == 0);
    }
};

#endif