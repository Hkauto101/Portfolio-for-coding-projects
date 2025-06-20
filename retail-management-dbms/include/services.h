#pragma once
#include "repository.h"  // Ensure this file exists and contains the repository class declarations

namespace dsms {

class InventoryService {
private:
    ItemRepository& itemRepo;
    PromotionRepository& promoRepo;

public:
    InventoryService(ItemRepository& repo, PromotionRepository& promoRepo)
        : itemRepo(repo), promoRepo(promoRepo) {}
    
    InventoryService() = delete;
    
    std::shared_ptr<Item> getItem(int id) {
        return itemRepo.findById(id);
    }
    
    std::vector<std::shared_ptr<Item>> getItemsByDepartment(const std::string& dept) {
        return itemRepo.findByDepartment(dept);
    }
};

class SalesService {
private:
    SaleRepository& saleRepo;
    ItemRepository& itemRepo;
    FinancialRecordRepository& financeRepo;
    InventoryService& inventoryService;

public:
    SalesService(SaleRepository& sRepo, ItemRepository& iRepo,
                FinancialRecordRepository& fRepo, InventoryService& invService)
        : saleRepo(sRepo), itemRepo(iRepo), financeRepo(fRepo), inventoryService(invService) {}
    
    SalesService() = delete;
    
    bool recordSale(int item_id, int quantity) {
        auto item = itemRepo.findById(item_id);
        if (!item) return false;
        
        Sale sale;
        sale.setItemId(item_id);
        sale.setQuantity(quantity);
        sale.setTotal(item->getPrice() * quantity);
        sale.setTimestamp(time(nullptr));
        
        return saleRepo.save(sale);
    }
};

class FinancialService {
private:
    FinancialRecordRepository& financeRepo;
    SaleRepository& saleRepo;

public:
    FinancialService(FinancialRecordRepository& fRepo, SaleRepository& sRepo)
        : financeRepo(fRepo), saleRepo(sRepo) {}
    
    FinancialService() = delete;
    
    double getTotalRevenue(time_t start, time_t end) {
        auto sales = saleRepo.findByDateRange(start, end);
        double total = 0.0;
        for (const auto& sale : sales) {
            total += sale->getTotal();
        }
        return total;
    }
};

class PromotionService {
private:
    PromotionRepository& promoRepo;
    ItemRepository& itemRepo;

public:
    PromotionService(PromotionRepository& pRepo, ItemRepository& iRepo)
        : promoRepo(pRepo), itemRepo(iRepo) {}
    
    PromotionService() = delete;
    
    std::vector<std::shared_ptr<Promotion>> getActivePromotions() {
        return promoRepo.findActivePromotions();
    }
};

} // namespace dsms
