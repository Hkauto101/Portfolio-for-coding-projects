// api.h - REST API controller declarations
#pragma once

#include <cpprest/http_listener.h>
#include <cpprest/json.h>
#include <vector>
#include <map>
#include <memory>
#include <string>

// Include services header to define complete service types
#include "services.h"
#include "models.h"

namespace dsms {
    // Forward declarations to resolve circular dependencies
    class ItemsController;
    class SalesController;
    class FinancialController;
    class PromotionsController;

    // Base API Controller
    class ApiController {
    protected:
        // Utility methods for JSON conversion
        static web::json::value model_to_json(const std::shared_ptr<Model>& model);
        static web::json::value models_to_json(const std::vector<std::shared_ptr<Model>>& models);

    public:
        // Default HTTP method handlers
        virtual void handle_get(web::http::http_request request);
        virtual void handle_post(web::http::http_request request);
        virtual void handle_put(web::http::http_request request);
        virtual void handle_delete(web::http::http_request request);

        // Virtual destructor for proper inheritance
        virtual ~ApiController() = default;
    };

    // REST API Listener
    class ApiListener {
    private:
        web::http::experimental::listener::http_listener listener;

        // Service instances - ensure these are fully defined
        InventoryService inventory_service;
        SalesService sales_service;
        FinancialService financial_service;
        PromotionService promotion_service;

        // Controller instances - use pointers to break circular dependency
        std::unique_ptr<ItemsController> items_controller;
        std::unique_ptr<SalesController> sales_controller;
        std::unique_ptr<FinancialController> financial_controller;
        std::unique_ptr<PromotionsController> promotions_controller;

        // Private method to initialize controllers
        void initialize_controllers();

    public:
        // Constructor to set up routes
        ApiListener(const std::string& base_uri);

        // Constructor with explicit service references
        ApiListener(
            InventoryService& inv_service,
            SalesService& sales_service,
            FinancialService& fin_service,
            PromotionService& promo_service
        );

        // Start the listener
        void open();

        // Stop the listener
        void close();
    };

    // Items API Controller
    class ItemsController : public ApiController {
    private:
        InventoryService& inventory_service;
        SalesService& sales_service;

    public:
        // Constructor that takes service references
        ItemsController(InventoryService& inv_service, SalesService& sales_serv)
            : inventory_service(inv_service), sales_service(sales_serv) {}

        // Override base class methods
        void handle_get(web::http::http_request request) override;
        void handle_post(web::http::http_request request) override;
        void handle_put(web::http::http_request request) override;
        void handle_delete(web::http::http_request request) override;

        // Specific method for recording sales
        void handle_sales_post(web::http::http_request request);
    };

    // Sales API Controller
    class SalesController : public ApiController {
    private:
        SalesService& sales_service;

    public:
        // Constructor that takes sales service reference
        SalesController(SalesService& serv) : sales_service(serv) {}

        // Override base class methods
        void handle_get(web::http::http_request request) override;
        void handle_post(web::http::http_request request) override;
    };

    // Financial API Controller
    class FinancialController : public ApiController {
    private:
        FinancialService& financial_service;

    public:
        // Constructor that takes financial service reference
        FinancialController(FinancialService& serv) : financial_service(serv) {}

        // Override base class methods
        void handle_get(web::http::http_request request) override;
        void handle_post(web::http::http_request request) override;
    };

    // Promotions API Controller
    class PromotionsController : public ApiController {
    private:
        PromotionService& promotion_service;

    public:
        // Constructor that takes promotion service reference
        PromotionsController(PromotionService& serv) : promotion_service(serv) {}

        // Override base class methods
        void handle_get(web::http::http_request request) override;
        void handle_post(web::http::http_request request) override;
        void handle_put(web::http::http_request request) override;
        void handle_delete(web::http::http_request request) override;
    };

} // namespace dsms