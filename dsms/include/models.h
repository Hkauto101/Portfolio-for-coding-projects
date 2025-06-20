// models.h - Core data models for DSMS
#pragma once

#include <string>
#include <vector>
#include <ctime>
#include <memory>
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <algorithm>
#include <cctype>
#include "json_util.h"

namespace dsms {

// Helper functions moved inside namespace
namespace helpers {
    inline std::string escapeJson(const std::string& input) {
        std::string output;
        for (char c : input) {
            switch (c) {
                case '"': output += "\\\""; break;
                case '\\': output += "\\\\"; break;
                case '\b': output += "\\b"; break;
                case '\f': output += "\\f"; break;
                case '\n': output += "\\n"; break;
                case '\r': output += "\\r"; break;
                case '\t': output += "\\t"; break;
                default:
                    if (static_cast<unsigned char>(c) < 0x20 || c == 0x7f) {
                        char buf[7];
                        snprintf(buf, sizeof(buf), "\\u%04x", static_cast<unsigned char>(c));
                        output += buf;
                    } else {
                        output += c;
                    }
            }
        }
        return output;
    }

    inline std::string formatTimeToISO(time_t timestamp) {
        char buffer[80];
        std::tm* ptm = std::localtime(&timestamp);
        if (ptm == nullptr) {
            return "";
        }
        std::strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", ptm);
        return std::string(buffer);
    }
}

class Model {
protected:
    int id;
    time_t created_at;
    time_t updated_at;

public:
    Model() : id(0), created_at(time(nullptr)), updated_at(time(nullptr)) {}
    virtual ~Model() = default;
    
    int getId() const { return id; }
    void setId(int newId) { id = newId; }
    
    time_t getCreatedAt() const { return created_at; }
    time_t getUpdatedAt() const { return updated_at; }
    void updateTimestamp() { updated_at = time(nullptr); }
    
    virtual std::string toJsonString() const = 0;
};

class Item : public Model {
private:
    std::string name;
    std::string company;
    int quantity;
    double price;
    std::string department;

public:
    Item() : Model(), quantity(0), price(0.0) {}
    
    std::string getName() const { return name; }
    std::string getCompany() const { return company; }
    int getQuantity() const { return quantity; }
    double getPrice() const { return price; }
    std::string getDepartment() const { return department; }
    
    void setName(const std::string& n) { name = n; updateTimestamp(); }
    void setCompany(const std::string& c) { company = c; updateTimestamp(); }
    void setQuantity(int q) { quantity = q; updateTimestamp(); }
    void setPrice(double p) { price = p; updateTimestamp(); }
    void setDepartment(const std::string& d) { department = d; updateTimestamp(); }
    
    std::string toJsonString() const override {
        std::ostringstream ss;
        ss << "{"
           << "\"id\":" << id << ","
           << "\"name\":\"" << helpers::escapeJson(name) << "\","
           << "\"company\":\"" << helpers::escapeJson(company) << "\","
           << "\"quantity\":" << quantity << ","
           << "\"price\":" << price << ","
           << "\"department\":\"" << helpers::escapeJson(department) << "\","
           << "\"created_at\":\"" << helpers::formatTimeToISO(created_at) << "\","
           << "\"updated_at\":\"" << helpers::formatTimeToISO(updated_at) << "\""
           << "}";
        return ss.str();
    }
};

class Sale : public Model {
private:
    int item_id;
    int quantity;
    double total;
    time_t timestamp;

public:
    Sale() : Model(), item_id(0), quantity(0), total(0.0), timestamp(time(nullptr)) {}

    int getItemId() const { return item_id; }
    int getQuantity() const { return quantity; }
    double getTotal() const { return total; }
    time_t getTimestamp() const { return timestamp; }

    void setItemId(int id) { item_id = id; updateTimestamp(); }
    void setQuantity(int q) { quantity = q; updateTimestamp(); }
    void setTotal(double t) { total = t; updateTimestamp(); }
    void setTimestamp(time_t ts) { timestamp = ts; updateTimestamp(); }

    std::string toJsonString() const override {
        std::ostringstream ss;
        ss << "{"
           << "\"id\":" << id << ","
           << "\"item_id\":" << item_id << ","
           << "\"quantity\":" << quantity << ","
           << "\"total\":" << total << ","
           << "\"timestamp\":\"" << helpers::formatTimeToISO(timestamp) << "\","
           << "\"created_at\":\"" << helpers::formatTimeToISO(created_at) << "\","
           << "\"updated_at\":\"" << helpers::formatTimeToISO(updated_at) << "\""
           << "}";
        return ss.str();
    }
};

class FinancialRecord : public Model {
private:
    std::string type;
    double amount;
    std::string description;

public:
    FinancialRecord() : Model(), amount(0.0) {}

    std::string getType() const { return type; }
    double getAmount() const { return amount; }
    std::string getDescription() const { return description; }

    void setType(const std::string& t) { type = t; updateTimestamp(); }
    void setAmount(double a) { amount = a; updateTimestamp(); }
    void setDescription(const std::string& d) { description = d; updateTimestamp(); }

    std::string getCategory() const { return type; }
    void setCategory(const std::string& c) { type = c; updateTimestamp(); }

    // Add getDate and setDate methods
    time_t getDate() const { return created_at; }
    void setDate(time_t date) { created_at = date; updateTimestamp(); }

    std::string toJsonString() const override {
        std::ostringstream ss;
        ss << "{"
           << "\"id\":" << id << ","
           << "\"type\":\"" << helpers::escapeJson(type) << "\","
           << "\"amount\":" << amount << ","
           << "\"description\":\"" << helpers::escapeJson(description) << "\","
           << "\"created_at\":\"" << helpers::formatTimeToISO(created_at) << "\","
           << "\"updated_at\":\"" << helpers::formatTimeToISO(updated_at) << "\""
           << "}";
        return ss.str();
    }
};

class Promotion : public Model {
private:
    std::string department;
    double discount;
    time_t start_date;
    time_t end_date;
    std::vector<int> item_ids;

public:
    Promotion() : Model(), discount(0.0), start_date(0), end_date(0) {}

    std::string getDepartment() const { return department; }
    double getDiscount() const { return discount; }
    time_t getStartDate() const { return start_date; }
    time_t getEndDate() const { return end_date; }
    const std::vector<int>& getItemIds() const { return item_ids; }

    void setDepartment(const std::string& d) { department = d; updateTimestamp(); }
    void setDiscount(double d) { discount = d; updateTimestamp(); }
    void setStartDate(time_t sd) { start_date = sd; updateTimestamp(); }
    void setEndDate(time_t ed) { end_date = ed; updateTimestamp(); }
    void setItemIds(const std::vector<int>& ids) { item_ids = ids; updateTimestamp(); }

    // Add the missing `isActive` function
    bool isActive() const {
        time_t now = time(nullptr);
        return now >= start_date && now <= end_date;
    }

    // Add the missing `getDescription` function
    std::string getDescription() const { return department; }

    // Add the missing setDescription function
    void setDescription(const std::string& desc) { department = desc; updateTimestamp(); }

    // Add the missing setActive function
    void setActive(bool active) { 
        time_t now = time(nullptr);
        if (active) {
            start_date = now;
        } else {
            end_date = now;
        }
        updateTimestamp();
    }

    std::string toJsonString() const override {
        std::ostringstream ss;
        ss << "{"
           << "\"id\":" << id << ","
           << "\"department\":\"" << helpers::escapeJson(department) << "\","
           << "\"discount\":" << discount << ","
           << "\"start_date\":\"" << helpers::formatTimeToISO(start_date) << "\","
           << "\"end_date\":\"" << helpers::formatTimeToISO(end_date) << "\","
           << "\"item_ids\":[";

        for (size_t i = 0; i < item_ids.size(); ++i) {
            if (i != 0) ss << ",";
            ss << item_ids[i];
        }

        ss << "],"
           << "\"created_at\":\"" << helpers::formatTimeToISO(created_at) << "\","
           << "\"updated_at\":\"" << helpers::formatTimeToISO(updated_at) << "\""
           << "}";
        return ss.str();
    }
};