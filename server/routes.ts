import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCategorySchema, 
  insertLocationSchema,
  insertProductSchema,
  insertInventorySchema,
  insertStockMovementSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const router = express.Router();
  
  // Categories API
  router.get("/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  router.post("/categories", async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const categoryData = result.data;
      
      // Check if category already exists
      const existingCategory = await storage.getCategoryByName(categoryData.name);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  router.put("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const result = insertCategorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const categoryData = result.data;
      
      // Check if name is being updated and if it already exists
      if (categoryData.name) {
        const existingCategory = await storage.getCategoryByName(categoryData.name);
        if (existingCategory && existingCategory.id !== id) {
          return res.status(400).json({ message: "Category with this name already exists" });
        }
      }
      
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  router.delete("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      // Check if category exists
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if products are using this category
      const products = await storage.getProducts();
      const inUse = products.some(p => p.categoryId === id);
      if (inUse) {
        return res.status(400).json({ message: "Cannot delete category that is in use by products" });
      }
      
      await storage.deleteCategory(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Locations API
  router.get("/locations", async (_req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  
  router.post("/locations", async (req, res) => {
    try {
      const result = insertLocationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const locationData = result.data;
      
      // Check if location already exists
      const existingLocation = await storage.getLocationByName(locationData.name);
      if (existingLocation) {
        return res.status(400).json({ message: "Location with this name already exists" });
      }
      
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to create location" });
    }
  });
  
  router.put("/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const result = insertLocationSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const locationData = result.data;
      
      // Check if name is being updated and if it already exists
      if (locationData.name) {
        const existingLocation = await storage.getLocationByName(locationData.name);
        if (existingLocation && existingLocation.id !== id) {
          return res.status(400).json({ message: "Location with this name already exists" });
        }
      }
      
      const location = await storage.updateLocation(id, locationData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to update location" });
    }
  });
  
  router.delete("/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      // Check if location exists
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check if inventory items are using this location
      const inventoryItems = await storage.getInventoryItems();
      const inUse = inventoryItems.some(i => i.locationId === id);
      if (inUse) {
        return res.status(400).json({ message: "Cannot delete location that has inventory items" });
      }
      
      await storage.deleteLocation(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });
  
  // Products API
  router.get("/products", async (_req, res) => {
    try {
      const products = await storage.getProductsWithDetails();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  router.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const category = await storage.getCategory(product.categoryId);
      
      // Get inventory for this product
      const inventoryItems = await storage.getInventoryItems();
      const productInventory = inventoryItems.filter(i => i.productId === id);
      
      let totalStock = 0;
      for (const item of productInventory) {
        totalStock += item.quantity;
      }
      
      res.json({
        ...product,
        categoryName: category?.name,
        stockQuantity: totalStock,
        inventory: productInventory
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  router.post("/products", async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const productData = result.data;
      
      // Check if SKU already exists
      const existingProduct = await storage.getProductBySku(productData.sku);
      if (existingProduct) {
        return res.status(400).json({ message: "Product with this SKU already exists" });
      }
      
      // Check if category exists
      const category = await storage.getCategory(productData.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Category does not exist" });
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  router.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const result = insertProductSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const productData = result.data;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if SKU is being updated and if it already exists
      if (productData.sku && productData.sku !== existingProduct.sku) {
        const productWithSku = await storage.getProductBySku(productData.sku);
        if (productWithSku) {
          return res.status(400).json({ message: "Product with this SKU already exists" });
        }
      }
      
      // Check if category exists if being updated
      if (productData.categoryId && productData.categoryId !== existingProduct.categoryId) {
        const category = await storage.getCategory(productData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category does not exist" });
        }
      }
      
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  router.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Check if product exists
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if inventory items exist for this product
      const inventoryItems = await storage.getInventoryItems();
      const inUse = inventoryItems.some(i => i.productId === id);
      if (inUse) {
        return res.status(400).json({ message: "Cannot delete product that has inventory items" });
      }
      
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Inventory API
  router.get("/inventory", async (req: Request, res: Response) => {
    try {
      // Parse query parameters for filtering
      const category = req.query.category as string;
      const location = req.query.location as string;
      const stockStatus = req.query.stockStatus as string;
      const search = req.query.search as string;
      
      let inventory = await storage.getInventoryItemsWithDetails();
      
      // Apply filters
      if (category) {
        inventory = inventory.filter(item => item.categoryName === category);
      }
      
      if (location) {
        inventory = inventory.filter(item => item.locationName === location);
      }
      
      if (stockStatus) {
        inventory = inventory.filter(item => {
          const minLevel = item.minStockLevel || 0;
          
          if (stockStatus === 'In Stock' && item.quantity > minLevel) {
            return true;
          } else if (stockStatus === 'Low Stock' && item.quantity > 0 && item.quantity <= minLevel) {
            return true;
          } else if (stockStatus === 'Out of Stock' && item.quantity === 0) {
            return true;
          }
          
          return false;
        });
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        inventory = inventory.filter(item => 
          (item.productName && item.productName.toLowerCase().includes(searchLower)) ||
          (item.productSku && item.productSku.toLowerCase().includes(searchLower)) ||
          (item.categoryName && item.categoryName.toLowerCase().includes(searchLower)) ||
          (item.locationName && item.locationName.toLowerCase().includes(searchLower))
        );
      }
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  
  router.post("/inventory", async (req, res) => {
    try {
      const result = insertInventorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const inventoryData = result.data;
      
      // Check if product exists
      const product = await storage.getProduct(inventoryData.productId);
      if (!product) {
        return res.status(400).json({ message: "Product does not exist" });
      }
      
      // Check if location exists
      const location = await storage.getLocation(inventoryData.locationId);
      if (!location) {
        return res.status(400).json({ message: "Location does not exist" });
      }
      
      // Check if inventory already exists for this product and location
      const existingInventory = await storage.getInventoryByProductAndLocation(
        inventoryData.productId, 
        inventoryData.locationId
      );
      
      if (existingInventory) {
        return res.status(400).json({ 
          message: "Inventory already exists for this product and location. Use PUT to update." 
        });
      }
      
      const inventory = await storage.createInventoryItem(inventoryData);
      
      // Create a stock movement record
      await storage.createStockMovement({
        productId: inventoryData.productId,
        locationId: inventoryData.locationId,
        quantity: inventoryData.quantity ?? 0, // Use default value if undefined
        note: "Initial inventory"
      });
      
      res.status(201).json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  
  router.put("/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory ID" });
      }
      
      const result = insertInventorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const inventoryData = result.data;
      
      // Check if inventory exists
      const existingInventory = await storage.getInventoryItem(id);
      if (!existingInventory) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      // If changing product or location, check if the new combination already exists
      if ((inventoryData.productId && inventoryData.productId !== existingInventory.productId) ||
          (inventoryData.locationId && inventoryData.locationId !== existingInventory.locationId)) {
            
        const productId = inventoryData.productId || existingInventory.productId;
        const locationId = inventoryData.locationId || existingInventory.locationId;
        
        const duplicateInventory = await storage.getInventoryByProductAndLocation(productId, locationId);
        if (duplicateInventory && duplicateInventory.id !== id) {
          return res.status(400).json({ 
            message: "Inventory already exists for this product and location" 
          });
        }
      }
      
      // Calculate quantity change for stock movement record
      const oldQuantity = existingInventory.quantity;
      const newQuantity = inventoryData.quantity !== undefined ? inventoryData.quantity : oldQuantity;
      
      const inventory = await storage.updateInventoryItem(id, inventoryData);
      
      // If quantity changed, create a stock movement record
      if (inventoryData.quantity !== undefined && inventoryData.quantity !== oldQuantity) {
        await storage.createStockMovement({
          productId: inventory!.productId,
          locationId: inventory!.locationId,
          quantity: newQuantity - oldQuantity,
          note: "Inventory adjustment"
        });
      }
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  
  router.delete("/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory ID" });
      }
      
      // Check if inventory exists
      const inventory = await storage.getInventoryItem(id);
      if (!inventory) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      // Create a stock movement record for the removal
      await storage.createStockMovement({
        productId: inventory.productId,
        locationId: inventory.locationId,
        quantity: -inventory.quantity,
        note: "Inventory removed"
      });
      
      await storage.deleteInventoryItem(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });
  
  // Stock Movements API
  router.get("/stock-movements", async (_req, res) => {
    try {
      const movements = await storage.getStockMovementsWithDetails();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });
  
  router.post("/stock-movements", async (req, res) => {
    try {
      const result = insertStockMovementSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const movementData = result.data;
      
      // Check if product exists
      const product = await storage.getProduct(movementData.productId);
      if (!product) {
        return res.status(400).json({ message: "Product does not exist" });
      }
      
      // Check if location exists
      const location = await storage.getLocation(movementData.locationId);
      if (!location) {
        return res.status(400).json({ message: "Location does not exist" });
      }
      
      // Create the stock movement
      const movement = await storage.createStockMovement(movementData);
      res.status(201).json(movement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });
  
  // Dashboard API
  router.get("/dashboard", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const lowStockItems = await storage.getLowStockItems();
      const recentMovements = await storage.getRecentStockMovements(5);
      
      res.json({
        stats,
        lowStockItems,
        recentMovements
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  // CSV Import/Export API
  router.post("/import", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (!type || !data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid import data format" });
      }
      
      let importCount = 0;
      let errorCount = 0;
      
      if (type === "products") {
        const productSchema = z.object({
          name: z.string().min(1),
          sku: z.string().min(1),
          description: z.string().optional(),
          categoryName: z.string().min(1),
          unitCost: z.number().positive(),
          minStockLevel: z.number().int().positive()
        });
        
        for (const item of data) {
          try {
            const result = productSchema.safeParse(item);
            if (!result.success) continue;
            
            const productData = result.data;
            
            // Check if product with this SKU already exists
            const existingProduct = await storage.getProductBySku(productData.sku);
            if (existingProduct) {
              errorCount++;
              continue;
            }
            
            // Get or create category
            let category = await storage.getCategoryByName(productData.categoryName);
            if (!category) {
              category = await storage.createCategory({ 
                name: productData.categoryName, 
                description: "" 
              });
            }
            
            // Create product
            await storage.createProduct({
              name: productData.name,
              sku: productData.sku,
              description: productData.description || "",
              categoryId: category.id,
              unitCost: productData.unitCost,
              minStockLevel: productData.minStockLevel
            });
            
            importCount++;
          } catch (error) {
            errorCount++;
          }
        }
      } else if (type === "inventory") {
        const inventorySchema = z.object({
          sku: z.string().min(1),
          locationName: z.string().min(1),
          quantity: z.number().int().nonnegative()
        });
        
        for (const item of data) {
          try {
            const result = inventorySchema.safeParse(item);
            if (!result.success) {
              errorCount++;
              continue;
            }
            
            const inventoryData = result.data;
            
            // Find product by SKU
            const product = await storage.getProductBySku(inventoryData.sku);
            if (!product) {
              errorCount++;
              continue;
            }
            
            // Get or create location
            let location = await storage.getLocationByName(inventoryData.locationName);
            if (!location) {
              location = await storage.createLocation({ 
                name: inventoryData.locationName, 
                description: "" 
              });
            }
            
            // Check if inventory already exists
            const existingInventory = await storage.getInventoryByProductAndLocation(
              product.id, 
              location.id
            );
            
            if (existingInventory) {
              // Update existing inventory
              await storage.updateInventoryItem(existingInventory.id, {
                quantity: inventoryData.quantity
              });
              
              // Create stock movement for the difference
              const quantityDiff = inventoryData.quantity - existingInventory.quantity;
              if (quantityDiff !== 0) {
                await storage.createStockMovement({
                  productId: product.id,
                  locationId: location.id,
                  quantity: quantityDiff,
                  note: "Imported inventory adjustment"
                });
              }
            } else {
              // Create new inventory
              await storage.createInventoryItem({
                productId: product.id,
                locationId: location.id,
                quantity: inventoryData.quantity
              });
              
              // Create stock movement
              if (inventoryData.quantity > 0) {
                await storage.createStockMovement({
                  productId: product.id,
                  locationId: location.id,
                  quantity: inventoryData.quantity,
                  note: "Imported inventory"
                });
              }
            }
            
            importCount++;
          } catch (error) {
            errorCount++;
          }
        }
      } else {
        return res.status(400).json({ message: "Unsupported import type" });
      }
      
      res.json({
        message: `Import completed with ${importCount} items imported and ${errorCount} errors`,
        imported: importCount,
        errors: errorCount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import data" });
    }
  });
  
  router.get("/export/:type", async (req, res) => {
    try {
      const type = req.params.type;
      
      if (type === "products") {
        const products = await storage.getProductsWithDetails();
        
        // Transform products for export
        const exportData = products.map(product => ({
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          categoryName: product.categoryName || "",
          unitCost: product.unitCost,
          minStockLevel: product.minStockLevel,
          stockQuantity: product.stockQuantity || 0
        }));
        
        res.json(exportData);
      } else if (type === "inventory") {
        const inventory = await storage.getInventoryItemsWithDetails();
        
        // Transform inventory for export
        const exportData = inventory.map(item => ({
          productName: item.productName || "",
          sku: item.productSku || "",
          locationName: item.locationName || "",
          quantity: item.quantity,
          minStockLevel: item.minStockLevel || 0
        }));
        
        res.json(exportData);
      } else if (type === "stock-movements") {
        const movements = await storage.getStockMovementsWithDetails();
        
        // Transform movements for export
        const exportData = movements.map(movement => ({
          productName: movement.productName || "",
          locationName: movement.locationName || "",
          quantity: movement.quantity,
          note: movement.note || "",
          timestamp: movement.timestamp.toISOString()
        }));
        
        res.json(exportData);
      } else {
        res.status(400).json({ message: "Unsupported export type" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  
  app.use("/api", router);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
