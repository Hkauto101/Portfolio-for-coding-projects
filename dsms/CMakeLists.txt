cmake_minimum_required(VERSION 3.14)
project(dsms VERSION 1.0)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Integrate vcpkg with CMake (use the absolute path to vcpkg)
set(CMAKE_TOOLCHAIN_FILE "C:/Users/hassa/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")

# Ensure the toolchain file is being used
if(NOT EXISTS "${CMAKE_TOOLCHAIN_FILE}")
    message(FATAL_ERROR "CMAKE_TOOLCHAIN_FILE doesn't exist: ${CMAKE_TOOLCHAIN_FILE}")
endif()

# Print some debug information
message(STATUS "Vcpkg toolchain file: ${CMAKE_TOOLCHAIN_FILE}")
message(STATUS "CMAKE_PREFIX_PATH: ${CMAKE_PREFIX_PATH}")

# Find required packages (specify the NAMES to look for different variations)
find_package(cpprestsdk CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Add source files
add_executable(dsms
    src/main.cpp
    src/api_impl.cpp
    src/services.cpp      

)

# Link libraries (use the updated target names)
target_link_libraries(dsms PRIVATE
    cpprestsdk::cpprest
    nlohmann_json::nlohmann_json
)

# If using filesystem (may need to link it explicitly on some systems)
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" AND CMAKE_CXX_COMPILER_VERSION VERSION_LESS 9.0)
    target_link_libraries(dsms PRIVATE stdc++fs)
endif()

# Copy web files to build directory
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/web DESTINATION ${CMAKE_BINARY_DIR})