cmake_minimum_required(VERSION 3.10)
project(AuthService)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(OpenSSL REQUIRED)

include_directories(serviceComponent/include ${OPENSSL_INCLUDE_DIR})

find_library(BCRYPT_LIB bcrypt)

set(SOURCES serviceComponent/src/main.cpp)

add_executable(auth_service ${SOURCES})

target_link_libraries(auth_service 
    pthread 
    bcrypt
    pqxx
    OpenSSL::SSL 
    OpenSSL::Crypto
)