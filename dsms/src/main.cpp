#pragma once

#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <map>
#include <algorithm>
#include <filesystem>
#include <mutex>
#include <functional>
#include <ctime>
#include <nlohmann/json.hpp>
#include "json_util.h"
#include "models.h"

namespace fs = std::filesystem;

namespace dsms {

template<typename T>
class Repository {
public:
    virtual ~Repository() = default;
    virtual std::shared_ptr<T> findById(int id) = 0;
    virtual std::vector<std::shared_ptr<T>> findAll() = 0;
    virtual bool save(const T& item) = 0;
    virtual bool update(const T& item) = 0;
    virtual bool remove(int id) = 0;
};

template<typename T>
class JsonRepository : public Repository<T> {
private:
    std::string filename;
    std::map<int, std::shared_ptr<T>> cache;
    int next_id;
    std::mutex mutex_;

    void loadCache() {
        std::lock_guard<std::mutex> lock(mutex_);
        cache.clear();
        next_id = 1;
        
        if (!fs::exists(filename)) {
            fs::path dir = fs::path(filename).parent_path();
            if (!dir.empty() && !fs::exists(dir)) {
                fs::create_directories(dir);
            }
            std::ofstream file(filename);
            file << "[]";
            return;
        }
        
        try {
            std::ifstream file(filename);
            nlohmann::json jsonData;
            file >> jsonData;  // Parse the file into a json object
            
            // Process the data here
            for (const auto& itemData : jsonData) {
                Item item = itemData.get<Item>();  // Assuming you have a from_json function
                cache[item.getId()] = std::make_shared<Item>(item);
            }
        } catch (const std::exception& e) {
            std::cerr << "Error loading data: " << e.what() << std::endl;
        }
    }
    
    void saveCache() {
        std::lock_guard<std::mutex> lock(mutex_);
        try {
            nlohmann::json jsonData;
            for (const auto& pair : cache) {
                // Serialize the Item object into JSON
                jsonData.push_back(pair.second);
            }

            std::ofstream file(filename);
            file << jsonData.dump(4); // Pretty print the JSON with an indentation of 4 spaces
        } catch (const std::exception& e) {
            std::cerr << "Error saving data: " << e.what() << std::endl;
        }
    }

public:
    JsonRepository(const std::string& file) : filename(file), next_id(1) {
        fs::path dir = fs::path(filename).parent_path();
        if (!dir.empty() && !fs::exists(dir)) {
            fs::create_directories(dir);
        }
        loadCache();
    }

    std::shared_ptr<T> findById(int id) override {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = cache.find(id);
        return (it != cache.end()) ? it->second : nullptr;
    }

    std::vector<std::shared_ptr<T>> findAll() override {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<std::shared_ptr<T>> result;
        for (const auto& pair : cache) {
            result.push_back(pair.second);
        }
        return result;
    }

    bool save(const T& item) override {
        std::lock_guard<std::mutex> lock(mutex_);
        T mutable_item = item;
        if (mutable_item.getId() <= 0) {
            mutable_item.setId(next_id++);
        }
        cache[mutable_item.getId()] = std::make_shared<T>(mutable_item);
        saveCache();
        return true;
    }

    bool update(const T& item) override {
        std::lock_guard<std::mutex> lock(mutex_);
        int id = item.getId();
        if (cache.find(id) == cache.end()) return false;
        cache[id] = std::make_shared<T>(item);
        saveCache();
        return true;
    }

    bool remove(int id) override {
        std::lock_guard<std::mutex> lock(mutex_);
        if (cache.erase(id) > 0) {
            saveCache();
            return true;
        }
        return false;
    }

    template<typename Predicate>
    std::vector<std::shared_ptr<T>> filter(Predicate predicate) {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<std::shared_ptr<T>> result;
        for (const auto& pair : cache) {
            if (predicate(pair.second)) {
                result.push_back(pair.second);
            }
        }
        return result;
    }
};

class ItemRepository : public JsonRepository<Item> {
public:
    ItemRepository() : JsonRepository<Item>("data/items.json") {}
    
    std::vector<std::shared_ptr<Item>> findByDepartment(const std::string& dept) {
        return filter([&dept](const std::shared_ptr<Item>& item) {
            return item && item->getDepartment() == dept;
        });
    }
};

// Similarly define SaleRepository, FinancialRecordRepository, PromotionRepository...

} // namespace dsms
