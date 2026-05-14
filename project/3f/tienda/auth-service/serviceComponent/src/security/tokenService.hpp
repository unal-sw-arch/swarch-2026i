#ifndef TOKEN_SERVICE_H
#define TOKEN_SERVICE_H

#include <jwt-cpp/jwt.h>
#include <string>
#include "../models/user.hpp"

class TokenService {
private:
    inline static const std::string SECRET_KEY = "GrupoF_Secret";

public:
    static std::string generateToken(int userId, UserRole role) {
        auto token = jwt::create()
            .set_issuer("auth_service")
            .set_type("JWS")
            .set_payload_claim("userId", jwt::claim(std::to_string(userId)))
            .set_payload_claim("role", jwt::claim(std::to_string(static_cast<int>(role))))
            .sign(jwt::algorithm::hs256{SECRET_KEY});
        return token;
    }

    static UserRole verifyAndGetRole(const std::string& tokenStr) {
        try {
            auto decoded = jwt::decode(tokenStr);
            auto verifier = jwt::verify()
                .allow_algorithm(jwt::algorithm::hs256{SECRET_KEY})
                .with_issuer("auth_service");

            verifier.verify(decoded);

            int roleVal = std::stoi(decoded.get_payload_claim("role").as_string());
            return static_cast<UserRole>(roleVal);
        } catch (const std::exception& e) {
            return UserRole::NORMAL;
        }
    }
};

#endif