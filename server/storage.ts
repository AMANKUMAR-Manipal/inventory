import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  locations, type Location, type InsertLocation,
  products, type Product, type InsertProduct, type ProductWithDetails,
  inventory, type Inventory, type InsertInventory, type InventoryWithDetails,
  stockMovements, type StockMovement, type InsertStockMovement, type StockMovementWithDetails
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

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
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
    const [category] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true; // If no error was thrown, we consider it successful
  }

  async getLocations(): Promise<Location[]> {
    return db.select().from(locations);
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
    const [location] = await db.update(locations)
      .set(updateData)
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    await db.delete(locations).where(eq(locations.id, id));
    return true;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductsWithDetails(): Promise<ProductWithDetails[]> {
    const productsWithCategory = await db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      description: products.description,
      categoryId: products.categoryId,
      unitCost: products.unitCost,
      minStockLevel: products.minStockLevel,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

    // Retrieve stock quantities for each product
    const productsWithDetails: ProductWithDetails[] = [];

    for (const product of productsWithCategory) {
      // Get total stock for this product
      const stockResult = await db.select({
        total: sql<number>`sum(${inventory.quantity})`,
      })
      .from(inventory)
      .where(eq(inventory.productId, product.id));

      const stockQuantity = stockResult[0]?.total || 0;

      productsWithDetails.push({
        ...product,
        stockQuantity,
      });
    }

    return productsWithDetails;
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
    const [product] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  async getInventoryItems(): Promise<Inventory[]> {
    return db.select().from(inventory);
  }

  async getInventoryItemsWithDetails(): Promise<InventoryWithDetails[]> {
    const result = await db.select({
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

    return result;
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async getInventoryByProductAndLocation(productId: number, locationId: number): Promise<Inventory | undefined> {
    const [item] = await db.select()
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
    const [item] = await db.insert(inventory)
      .values({
        ...insertInventory,
        updatedAt: new Date(),
      })
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db.update(inventory)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventory).where(eq(inventory.id, id));
    return true;
  }

  async getStockMovements(): Promise<StockMovement[]> {
    return db.select().from(stockMovements);
  }

  async getStockMovementsWithDetails(): Promise<StockMovementWithDetails[]> {
    const result = await db.select({
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

    return result;
  }

  async getStockMovement(id: number): Promise<StockMovement | undefined> {
    const [movement] = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return movement;
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await db.insert(stockMovements)
      .values({
        ...insertMovement,
        timestamp: new Date(),
      })
      .returning();
    return movement;
  }

  async getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
    stockMovements: number;
  }> {
    // Get total products
    const productsCountResult = await db.select({ count: sql<number>`count(*)` }).from(products);
    const totalProducts = productsCountResult[0]?.count || 0;

    // Get inventory items with details
    const inventoryItems = await this.getInventoryItemsWithDetails();
    
    // Calculate low stock items
    let lowStockItems = 0;
    let inventoryValue = 0;
    
    for (const item of inventoryItems) {
      // Get the product to access its unit cost and min stock level
      const product = await this.getProduct(item.productId);
      if (product) {
        // Add to inventory value
        inventoryValue += item.quantity * product.unitCost;
        
        // Check if this is a low stock item
        if (item.quantity <= product.minStockLevel) {
          lowStockItems++;
        }
      }
    }
    
    // Get total stock movements
    const movementsCountResult = await db.select({ count: sql<number>`count(*)` }).from(stockMovements);
    const stockMovementsCount = movementsCountResult[0]?.count || 0;
    
    return {
      totalProducts,
      lowStockItems,
      inventoryValue,
      stockMovements: stockMovementsCount,
    };
  }

  async getLowStockItems(): Promise<InventoryWithDetails[]> {
    const inventoryItems = await this.getInventoryItemsWithDetails();
    
    // Filter to only include low stock items
    return inventoryItems.filter(item => {
      return item.quantity <= (item.minStockLevel || 0);
    });
  }

  async getRecentStockMovements(limit: number): Promise<StockMovementWithDetails[]> {
    const movements = await db.select({
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