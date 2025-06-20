// Helper functions for path and query parameter parsing
#include "api.h"
#include <cpprest/uri.h>
#include <regex>
#include <string>
#include <vector>
#include <map>
#include <iterator>

namespace dsms {

std::vector<std::string> split_path(const web::http::http_request& request) {
    // Convert from utility::string_t to std::string
    auto relative_path = utility::conversions::to_utf8string(
        web::uri::decode(request.relative_uri().path())
    );
    
    std::vector<std::string> path_segments;
    
    // Skip the first character if it's a '/'
    size_t start = (relative_path.size() > 0 && relative_path[0] == '/') ? 1 : 0;
    
    size_t pos = start;
    while (pos < relative_path.size()) {
        size_t next_pos = relative_path.find('/', pos);
        if (next_pos == std::string::npos) {
            path_segments.push_back(relative_path.substr(pos));
            break;
        }
        path_segments.push_back(relative_path.substr(pos, next_pos - pos));
        pos = next_pos + 1;
    }
    
    return path_segments;
}

std::map<std::string, std::string> parse_query_params(const web::http::http_request& request) {
    // Convert from utility::string_t to std::string
    auto query = utility::conversions::to_utf8string(
        web::uri::decode(request.relative_uri().query())
    );
    
    std::map<std::string, std::string> params;
    
    std::regex pattern("([^&=]+)=([^&=]*)");
    auto words_begin = std::sregex_iterator(query.begin(), query.end(), pattern);
    auto words_end = std::sregex_iterator();
    
    for (std::sregex_iterator i = words_begin; i != words_end; ++i) {
        std::smatch match = *i;
        params[match[1].str()] = match[2].str();
    }
    
    return params;
}

} // namespace dsms