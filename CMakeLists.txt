cmake_minimum_required(VERSION 3.15)
project(TasencoBackend VERSION 1.0.0 LANGUAGES CXX)

# Crow y nlohmann/json andan bárbaro con C++11, pero vamos a forzar C++17
# para tener acceso a características modernas del lenguaje y optimizaciones.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Le decimos a CMake que busque la librería de hilos (POSIX Threads).
# Esto es VITAL porque en el main.cpp le pusimos app.multithreaded()
find_package(Threads REQUIRED)

# Definimos el ejecutable
add_executable(tasenco_api main.cpp)

# Linkeamos los hilos del sistema operativo directamente a nuestro binario.
target_link_libraries(tasenco_api PRIVATE Threads::Threads)

# Le decimos al compilador dónde buscar los archivos .h (.hpp)
# Si dejaste crow.h y json.hpp tirados en la misma carpeta del main.cpp, esto los encuentra.
target_include_directories(tasenco_api PRIVATE ${CMAKE_SOURCE_DIR})