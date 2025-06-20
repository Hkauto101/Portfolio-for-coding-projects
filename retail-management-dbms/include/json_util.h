#ifndef DSMS_JSON_UTIL_H
#define DSMS_JSON_UTIL_H

#include <string>
#include <map>
#include <vector>
#include <variant>
#include <sstream>
#include <iomanip>
#include <stdexcept>

namespace dsms {

class JsonValue {
public:
    using Array = std::vector<JsonValue>;
    using Object = std::map<std::string, JsonValue>;
    using Variant = std::variant<std::monostate, bool, double, std::string, Array, Object>;

    enum class Type { Null, Boolean, Number, String, Array, Object };

    JsonValue() : value(std::monostate{}) {}
    JsonValue(bool b) : value(b) {}
    JsonValue(double n) : value(n) {}
    JsonValue(const std::string& s) : value(s) {}
    JsonValue(const char* s) : value(std::string(s)) {}
    JsonValue(const Array& a) : value(a) {}
    JsonValue(const Object& o) : value(o) {}

    Type getType() const {
        return std::visit([](auto&& val) -> Type {
            using T = std::decay_t<decltype(val)>;
            if constexpr (std::is_same_v<T, std::monostate>) return Type::Null;
            if constexpr (std::is_same_v<T, bool>) return Type::Boolean;
            if constexpr (std::is_same_v<T, double>) return Type::Number;
            if constexpr (std::is_same_v<T, std::string>) return Type::String;
            if constexpr (std::is_same_v<T, Array>) return Type::Array;
            if constexpr (std::is_same_v<T, Object>) return Type::Object;
        }, value);
    }

    bool asBool() const { return std::get<bool>(value); }
    double asNumber() const { return std::get<double>(value); }
    const std::string& asString() const { return std::get<std::string>(value); }
    const Array& asArray() const { return std::get<Array>(value); }
    const Object& asObject() const { return std::get<Object>(value); }

private:
    Variant value;

    friend class JsonBuilder;
};

class JsonBuilder {
public:
    static std::string escapeString(const std::string& input) {
        std::ostringstream ss;
        for (char c : input) {
            switch (c) {
                case '"': ss << "\\\""; break;
                case '\\': ss << "\\\\"; break;
                case '\b': ss << "\\b"; break;
                case '\f': ss << "\\f"; break;
                case '\n': ss << "\\n"; break;
                case '\r': ss << "\\r"; break;
                case '\t': ss << "\\t"; break;
                default:
                    if (static_cast<unsigned char>(c) < 0x20 || c == 0x7f) {
                        ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') 
                           << static_cast<int>(c);
                    } else {
                        ss << c;
                    }
            }
        }
        return ss.str();
    }

    static std::string toJson(const JsonValue& value) {
        switch (value.getType()) {
            case JsonValue::Type::Null: return "null";
            case JsonValue::Type::Boolean: return value.asBool() ? "true" : "false";
            case JsonValue::Type::Number: return std::to_string(value.asNumber());
            case JsonValue::Type::String: return "\"" + escapeString(value.asString()) + "\"";
            case JsonValue::Type::Array: {
                std::string result = "[";
                bool first = true;
                for (const auto& item : value.asArray()) {
                    if (!first) result += ",";
                    result += toJson(item);
                    first = false;
                }
                return result + "]";
            }
            case JsonValue::Type::Object: {
                std::string result = "{";
                bool first = true;
                for (const auto& [key, val] : value.asObject()) {
                    if (!first) result += ",";
                    result += "\"" + escapeString(key) + "\":" + toJson(val);
                    first = false;
                }
                return result + "}";
            }
        }
        return "null"; // fallback
    }
};

class JsonObject {
private:
    JsonValue::Object data;

public:
    JsonObject() = default;

    void set(const std::string& key, const JsonValue& value) {
        data[key] = value;
    }

    void set(const std::string& key, const std::string& value) {
        data[key] = JsonValue(value);
    }

    void set(const std::string& key, double value) {
        data[key] = JsonValue(value);
    }

    void set(const std::string& key, int value) {
        data[key] = JsonValue(static_cast<double>(value));
    }

    void set(const std::string& key, bool value) {
        data[key] = JsonValue(value);
    }

    void set(const std::string& key, const std::vector<JsonValue>& array) {
        data[key] = JsonValue(array);
    }

    void set(const std::string& key, const std::map<std::string, JsonValue>& object) {
        data[key] = JsonValue(object);
    }

    JsonValue get(const std::string& key) const {
        auto it = data.find(key);
        if (it == data.end()) return JsonValue();
        return it->second;
    }

    std::string toString() const {
        return JsonBuilder::toJson(JsonValue(data));
    }

    void clear() {
        data.clear();
    }

    bool contains(const std::string& key) const {
        return data.find(key) != data.end();
    }
};

class JsonArray {
private:
    JsonValue::Array elements;

public:
    JsonArray() = default;

    void add(const JsonValue& value) {
        elements.push_back(value);
    }

    const JsonValue& get(size_t index) const {
        if (index >= elements.size()) throw std::out_of_range("Index out of range");
        return elements[index];
    }

    size_t size() const {
        return elements.size();
    }

    std::string toString() const {
        return JsonBuilder::toJson(JsonValue(elements));
    }

    void clear() {
        elements.clear();
    }
};

} // namespace dsms

#endif // DSMS_JSON_UTIL_H
