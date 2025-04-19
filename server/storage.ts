import { eq, and, desc, sql, count, asc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  locations, type Location, type InsertLocation,
  products, type Product, type InsertProduct, type ProductWithDetails,
  inventory, type Inventory, type InsertInventory, type InventoryWithDetails,
  stockMovements, type StockMovement, type InsertStockMovement, type StockMovementWithDetails,
  StockStatus
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Location operations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  getLocationByName(name: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsWithDetails(): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Inventory operations
  getInventoryItems(): Promise<Inventory[]>;
  getInventoryItemsWithDetails(): Promise<InventoryWithDetails[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventoryByProductAndLocation(productId: number, locationId: number): Promise<Inventory | undefined>;
  createInventoryItem(inventory: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Stock Movement operations
  getStockMovements(): Promise<StockMovement[]>;
  getStockMovementsWithDetails(): Promise<StockMovementWithDetails[]>;
  getStockMovement(id: number): Promise<StockMovement | undefined>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  
  // Dashboard operations
  getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
    stockMovements: number;
  }>;
  getLowStockItems(): Promise<InventoryWithDetails[]>;
  getRecentStockMovements(limit: number): Promise<StockMovementWithDetails[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true; // If no error is thrown, delete succeeded
  }

  // Location operations
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async getLocationByName(name: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.name, name));
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async updateLocation(id: number, updateData: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(locations)
      .set(updateData)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return true; // If no error is thrown, delete succeeded
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsWithDetails(): Promise<ProductWithDetails[]> {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        description: products.description,
        categoryId: products.categoryId,
        unitCost: products.unitCost,
        minStockLevel: products.minStockLevel,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    // Add stock quantity information by total across all locations
    const stockQuantities = await db
      .select({
        productId: inventory.productId,
        totalQuantity: sql<number>`SUM(${inventory.quantity})`,
      })
      .from(inventory)
      .groupBy(inventory.productId);

    const stockMap = new Map<number, number>();
    for (const stock of stockQuantities) {
      stockMap.set(stock.productId, stock.totalQuantity);
    }

    return productsData.map(product => ({
      ...product,
      stockQuantity: stockMap.get(product.id) || 0,
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true; // If no error is thrown, delete succeeded
  }

  // Inventory operations
  async getInventoryItems(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventoryItemsWithDetails(): Promise<InventoryWithDetails[]> {
    return await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        locationId: inventory.locationId,
        quantity: inventory.quantity,
        updatedAt: inventory.updatedAt,
        productName: products.name,
        productSku: products.sku,
        categoryName: categories.name,
        locationName: locations.name,
        minStockLevel: products.minStockLevel,
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(locations, eq(inventory.locationId, locations.id));
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async getInventoryByProductAndLocation(productId: number, locationId: number): Promise<Inventory | undefined> {
    const [item] = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.productId, productId),
          eq(inventory.locationId, locationId)
        )
      );
    return item;
  }

  async createInventoryItem(insertInventory: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(insertInventory).returning();
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [updatedItem] = await db
      .update(inventory)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventory).where(eq(inventory.id, id));
    return true; // If no error is thrown, delete succeeded
  }

  // Stock Movement operations
  async getStockMovements(): Promise<StockMovement[]> {
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.timestamp));
  }

  async getStockMovementsWithDetails(): Promise<StockMovementWithDetails[]> {
    return await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        locationId: stockMovements.locationId,
        quantity: stockMovements.quantity,
        note: stockMovements.note,
        timestamp: stockMovements.timestamp,
        productName: products.name,
        locationName: locations.name,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .leftJoin(locations, eq(stockMovements.locationId, locations.id))
      .orderBy(desc(stockMovements.timestamp));
  }

  async getStockMovement(id: number): Promise<StockMovement | undefined> {
    const [movement] = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return movement;
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await db.insert(stockMovements).values(insertMovement).returning();
    return movement;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
    stockMovements: number;
  }> {
    // Get total products
    const [productsCount] = await db
      .select({ count: count() })
      .from(products);
    
    // Get low stock items count
    const inventoryItems = await this.getInventoryItemsWithDetails();
    const lowStockItems = inventoryItems.filter(item => {
      return item.quantity < (item.minStockLevel || 0);
    }).length;

    // Get inventory value
    let inventoryValue = 0;
    for (const item of inventoryItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        inventoryValue += Number(product.unitCost) * item.quantity;
      }
    }

    // Get stock movement count
    const [movementsCount] = await db
      .select({ count: count() })
      .from(stockMovements);

    return {
      totalProducts: productsCount.count,
      lowStockItems,
      inventoryValue,
      stockMovements: movementsCount.count
    };
  }

  async getLowStockItems(): Promise<InventoryWithDetails[]> {
    const inventoryItems = await this.getInventoryItemsWithDetails();
    
    return inventoryItems.filter(item => {
      return item.quantity < (item.minStockLevel || 0);
    }).sort((a, b) => {
      // Sort by most critically low first
      const aRatio = a.quantity / (a.minStockLevel || 1);
      const bRatio = b.quantity / (b.minStockLevel || 1);
      return aRatio - bRatio;
    });
  }

  async getRecentStockMovements(limit: number): Promise<StockMovementWithDetails[]> {
    const movements = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        locationId: stockMovements.locationId,
        quantity: stockMovements.quantity,
        note: stockMovements.note,
        timestamp: stockMovements.timestamp,
        productName: products.name,
        locationName: locations.name,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .leftJoin(locations, eq(stockMovements.locationId, locations.id))
      .orderBy(desc(stockMovements.timestamp))
      .limit(limit);
      
    return movements;
  }
}

export const storage = new DatabaseStorage();