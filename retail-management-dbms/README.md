# Department Store Management System (DSMS)

A comprehensive retail management solution built with modern C++ featuring inventory management, sales tracking, financial reporting, and promotion management with a RESTful API and web interface.

## Features

- **Inventory Management**: Track items, quantities, prices, and departments
- **Sales Tracking**: Record and monitor sales with daily tracking from May 2025
- **Financial Management**: Track expenses, income, and generate reports
- **Promotions**: Create and manage time-based discount campaigns
- **REST API**: Complete HTTP API for system integration
- **Web Interface**: User-friendly browser-based interface

## System Requirements

- **Compiler**: C++17 compatible (GCC 8+, Clang 7+, or MSVC 2019+)
- **Build System**: CMake 3.14 or higher
- **Dependencies**: 
 - Microsoft C++ REST SDK (cpprestsdk)
 - nlohmann/json library
- **Platform**: Windows, macOS, or Linux
- **Browser**: Any modern web browser for the interface

## Installation

### Windows (vcpkg)
```bash
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
bootstrap-vcpkg.bat
vcpkg integrate install
vcpkg install cpprestsdk:x64-windows nlohmann-json:x64-windows

### MacOS
brew install cpprestsdk nlohmann-json cmake

### Ubuntu/Debian
sudo apt update
sudo apt install libcpprest-dev nlohmann-json3-dev cmake build-essential

## Build & Run (Same on all OS types)

1. Clone the repository
```bash
git clone <repository-url>
cd dsms

2. Build the project
```bash
mkdir build && cd build
cmake ..
make

3. Run the application
```bash
./dsms

4. Access the web interface
Open your browser and navigate to http://localhost:8080

## API Endpoints

-GET/POST /api/items - Manage inventory items
-GET/POST /api/sales - Handle sales operations
-GET /api/financials/report - Generate financial reports
-GET/POST /api/promotions - Manage promotions

## Project Structure
dsms/
├── .vscode/           # VS Code configuration files
├── build/             # CMake build output directory
├── data/              # JSON data storage files (created at runtime)
├── include/           # Header files (.h)
│   ├── models.h           # Data models
│   ├── repository.h       # Data access layer
│   ├── services.h         # Business logic services declarations
│   └── api.h              # API definitions
├── src/               # Source files (.cpp)
│   ├── main.cpp           # Main application entry
│   ├── services.cpp       # Business logic services implementation
│   └── api_impl.cpp       # API implementation
├── web/               # Web interface files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styling
│   └── app.js             # JavaScript functionality
└── CMakeLists.txt     # CMake build configuration

## License

This project is for educational and portfolio purposes.