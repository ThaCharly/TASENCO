#include "crow.h"
#include "json.hpp"
#include <fstream>
#include <iostream>

// Alias para no escribir nlohmann::json en todos lados
using json = nlohmann::json;

int main() {
    crow::SimpleApp app;

    // 1. IN-MEMORY CACHE: Cargamos el catálogo al arrancar
    json catalogo_cache;
    std::ifstream file("products.json");
    
    if (file.is_open()) {
        file >> catalogo_cache;
        std::cout << "[SUCCESS] Catálogo cargado en RAM. Listo para la guerra.\n";
    } else {
        std::cerr << "[ERROR] No se encontró products.json en la raíz.\n";
        return 1; // Matamos el proceso si no hay datos
    }

    // 2. EL ENDPOINT: Ruta GET que expone el catálogo
    // Capturamos 'catalogo_cache' por referencia [&] en la lambda 
    // para NO copiar el objeto en memoria con cada request.
    CROW_ROUTE(app, "/api/productos")
    ([&catalogo_cache]() {
        // Armamos la respuesta escupiendo el string del JSON
        auto response = crow::response(catalogo_cache.dump());
        
        // Cabeceras HTTP estrictas
        response.add_header("Content-Type", "application/json");
        
        // Magia negra obligatoria para que el frontend no te bloquee (CORS)
        response.add_header("Access-Control-Allow-Origin", "*");
        
        return response;
    });

    // 3. EL MOTOR: Levantamos el servidor con multithreading habilitado
    std::cout << "[INFO] Arrancando motor en puerto 8080...\n";
    app.port(8080).multithreaded().run();
}