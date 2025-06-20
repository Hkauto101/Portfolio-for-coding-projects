// services_impl.cpp - Service implementations
#include "services.h"

namespace dsms {

// Global repository instances
static ItemRepository g_item_repo;
static SaleRepository g_sale_repo;
static FinancialRecordRepository g_finance_repo;
static PromotionRepository g_promo_repo;

// Global service instances
InventoryService& getInventoryService() {
    static InventoryService instance(g_item_repo, g_promo_repo);
    return instance;
}

SalesService& getSalesService() {
    static SalesService instance(g_sale_repo, g_item_repo, g_finance_repo, getInventoryService());
    return instance;
}

FinancialService& getFinancialService() {
    static FinancialService instance(g_finance_repo, g_sale_repo);
    return instance;
}

PromotionService& getPromotionService() {
    static PromotionService instance(g_promo_repo, g_item_repo);
    return instance;
}

} // namespace dsms