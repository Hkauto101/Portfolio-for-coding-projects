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
            file >> jsonData;

            for (const auto& itemData : jsonData) {
                T item = itemData.get<T>(); // Deserialize using from_json
                cache[item.getId()] = std::make_shared<T>(item);
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
                jsonData.push_back(pair.second); // Serialize using to_json
            }

            std::ofstream file(filename);
            file << jsonData.dump(4);
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

// Item Repository
class ItemRepository : public JsonRepository<Item> {
public:
    ItemRepository() : JsonRepository<Item>("data/items.json") {}

    std::vector<std::shared_ptr<Item>> findByDepartment(const std::string& dept) {
        return filter([&dept](const std::shared_ptr<Item>& item) {
            return item && item->getDepartment() == dept;
        });
    }
};

// Sale Repository
class SaleRepository : public JsonRepository<Sale> {
public:
    SaleRepository() : JsonRepository<Sale>("data/sales.json") {}

    std::vector<std::shared_ptr<Sale>> findByDateRange(time_t start, time_t end) {
        return filter([start, end](const std::shared_ptr<Sale>& sale) {
            return sale->getTimestamp() >= start && sale->getTimestamp() <= end;
        });
    }
};

// Financial Record Repository
class FinancialRecordRepository : public JsonRepository<FinancialRecord> {
public:
    FinancialRecordRepository() : JsonRepository<FinancialRecord>("data/financial_records.json") {}

    std::vector<std::shared_ptr<FinancialRecord>> findByCategory(const std::string& category) {
        return filter([&category](const std::shared_ptr<FinancialRecord>& record) {
            return record->getCategory() == category;
        });
    }
};

// Promotion Repository
class PromotionRepository : public JsonRepository<Promotion> {
public:
    PromotionRepository() : JsonRepository<Promotion>("data/promotions.json") {}

    std::vector<std::shared_ptr<Promotion>> findActivePromotions() {
        return filter([](const std::shared_ptr<Promotion>& promo) {
            return promo->isActive();
        });
    }
};

// Serialization Functions for Sale, FinancialRecord, Promotion (Similar to Item)
void to_json(nlohmann::json& j, const Sale& sale) {
    j = nlohmann::json{
        {"id", sale.getId()},
        {"item_id", sale.getItemId()},
        {"quantity", sale.getQuantity()},
        {"total", sale.getTotal()},
        {"timestamp", sale.getTimestamp()}
    };
}

void from_json(const nlohmann::json& j, Sale& sale) {
    sale.setId(j.at("id").get<int>());
    sale.setItemId(j.at("item_id").get<int>());
    sale.setQuantity(j.at("quantity").get<int>());
    sale.setTotal(j.at("total").get<double>());
    sale.setTimestamp(j.at("timestamp").get<time_t>());
}

void to_json(nlohmann::json& j, const FinancialRecord& record) {
    j = nlohmann::json{
        {"id", record.getId()},
        {"category", record.getCategory()},
        {"amount", record.getAmount()},
        {"date", record.getDate()}
    };
}

void from_json(const nlohmann::json& j, FinancialRecord& record) {
    record.setId(j.at("id").get<int>());
    record.setCategory(j.at("category").get<std::string>());
    record.setAmount(j.at("amount").get<double>());
    record.setDate(j.at("date").get<std::string>());
}

void to_json(nlohmann::json& j, const Promotion& promo) {
    j = nlohmann::json{
        {"id", promo.getId()},
        {"description", promo.getDescription()},
        {"active", promo.isActive()}
    };
}

void from_json(const nlohmann::json& j, Promotion& promo) {
    promo.setId(j.at("id").get<int>());
    promo.setDescription(j.at("description").get<std::string>());
    promo.setActive(j.at("active").get<bool>());
}

} // namespace dsms
