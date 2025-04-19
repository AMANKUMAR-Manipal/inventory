import { 
  type User, type InsertUser, 
  type Product, type InsertProduct, 
  type Category, type InsertCategory,
  type Location, type InsertLocation,
  type Inventory, type InsertInventory,
  type StockMovement, type InsertStockMovement,
  type ProductWithDetails,
  type InventoryWithDetails,
  type StockMovementWithDetails,
  StockStatus
} from "@shared/schema";

// Interface for all storage operations
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private locations: Map<number, Location>;
  private products: Map<number, Product>;
  private inventory: Map<number, Inventory>;
  private stockMovements: Map<number, StockMovement>;
  
  private userId: number;
  private categoryId: number;
  private locationId: number;
  private productId: number;
  private inventoryId: number;
  private stockMovementId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.locations = new Map();
    this.products = new Map();
    this.inventory = new Map();
    this.stockMovements = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.locationId = 1;
    this.productId = 1;
    this.inventoryId = 1;
    this.stockMovementId = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async getLocationByName(name: string): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(
      (location) => location.name === name,
    );
  }
  
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }
  
  async updateLocation(id: number, updateData: Partial<InsertLocation>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;
    
    const updatedLocation = { ...location, ...updateData };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }
  
  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsWithDetails(): Promise<ProductWithDetails[]> {
    const products = await this.getProducts();
    return products.map(product => {
      const category = this.categories.get(product.categoryId);
      
      // Calculate total stock across all locations
      let stockQuantity = 0;
      Array.from(this.inventory.values()).forEach(inv => {
        if (inv.productId === product.id) {
          stockQuantity += inv.quantity;
        }
      });
      
      return {
        ...product,
        categoryName: category?.name,
        stockQuantity
      };
    });
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku,
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { 
      ...product, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Inventory methods
  async getInventoryItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }
  
  async getInventoryItemsWithDetails(): Promise<InventoryWithDetails[]> {
    const inventoryItems = await this.getInventoryItems();
    return inventoryItems.map(item => {
      const product = this.products.get(item.productId);
      const location = this.locations.get(item.locationId);
      const category = product ? this.categories.get(product.categoryId) : undefined;
      
      return {
        ...item,
        productName: product?.name,
        productSku: product?.sku,
        categoryName: category?.name,
        locationName: location?.name,
        minStockLevel: product?.minStockLevel
      };
    });
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }
  
  async getInventoryByProductAndLocation(productId: number, locationId: number): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(
      (inv) => inv.productId === productId && inv.locationId === locationId,
    );
  }
  
  async createInventoryItem(insertInventory: InsertInventory): Promise<Inventory> {
    const id = this.inventoryId++;
    const inventory: Inventory = { 
      ...insertInventory, 
      id, 
      updatedAt: new Date() 
    };
    this.inventory.set(id, inventory);
    return inventory;
  }
  
  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventoryItem = this.inventory.get(id);
    if (!inventoryItem) return undefined;
    
    const updatedInventory: Inventory = { 
      ...inventoryItem, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }
  
  // Stock Movement methods
  async getStockMovements(): Promise<StockMovement[]> {
    return Array.from(this.stockMovements.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  
  async getStockMovementsWithDetails(): Promise<StockMovementWithDetails[]> {
    const movements = await this.getStockMovements();
    return movements.map(movement => {
      const product = this.products.get(movement.productId);
      const location = this.locations.get(movement.locationId);
      
      return {
        ...movement,
        productName: product?.name,
        locationName: location?.name
      };
    });
  }
  
  async getStockMovement(id: number): Promise<StockMovement | undefined> {
    return this.stockMovements.get(id);
  }
  
  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const id = this.stockMovementId++;
    const now = new Date();
    const movement: StockMovement = { 
      ...insertMovement, 
      id, 
      timestamp: now 
    };
    
    this.stockMovements.set(id, movement);
    
    // Update inventory quantity
    const inventoryItem = await this.getInventoryByProductAndLocation(
      movement.productId, 
      movement.locationId
    );
    
    if (inventoryItem) {
      await this.updateInventoryItem(inventoryItem.id, {
        quantity: inventoryItem.quantity + movement.quantity
      });
    } else if (movement.quantity > 0) {
      // Create new inventory item if it doesn't exist and quantity is positive
      await this.createInventoryItem({
        productId: movement.productId,
        locationId: movement.locationId,
        quantity: movement.quantity
      });
    }
    
    return movement;
  }
  
  // Dashboard methods
  async getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    inventoryValue: number;
    stockMovements: number;
  }> {
    const products = await this.getProducts();
    const lowStockItems = await this.getLowStockItems();
    
    // Calculate total inventory value
    let inventoryValue = 0;
    const inventoryItems = await this.getInventoryItems();
    
    for (const item of inventoryItems) {
      const product = this.products.get(item.productId);
      if (product) {
        inventoryValue += item.quantity * product.unitCost;
      }
    }
    
    // Count recent stock movements (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMovements = Array.from(this.stockMovements.values()).filter(
      movement => movement.timestamp > oneWeekAgo
    );
    
    return {
      totalProducts: products.length,
      lowStockItems: lowStockItems.length,
      inventoryValue,
      stockMovements: recentMovements.length
    };
  }
  
  async getLowStockItems(): Promise<InventoryWithDetails[]> {
    const inventoryItems = await this.getInventoryItemsWithDetails();
    
    return inventoryItems.filter(item => {
      const product = this.products.get(item.productId);
      if (!product) return false;
      
      return item.quantity <= product.minStockLevel;
    }).sort((a, b) => {
      // Sort by most critical (lowest stock compared to minimum) first
      const aRatio = a.quantity / (a.minStockLevel || 1);
      const bRatio = b.quantity / (b.minStockLevel || 1);
      return aRatio - bRatio;
    });
  }
  
  async getRecentStockMovements(limit: number): Promise<StockMovementWithDetails[]> {
    const movements = await this.getStockMovementsWithDetails();
    return movements.slice(0, limit);
  }
  
  // Helper method to initialize some default data
  private initializeDefaultData() {
    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Furniture', description: 'Office and home furniture' },
      { name: 'Office Supplies', description: 'General office supplies' },
      { name: 'Clothing', description: 'Apparel and wearables' }
    ];
    
    categories.forEach(async (cat) => {
      await this.createCategory(cat);
    });
    
    // Create locations
    const locations = [
      { name: 'Warehouse A', description: 'Main storage warehouse' },
      { name: 'Warehouse B', description: 'Secondary storage facility' },
      { name: 'Store A', description: 'Retail location downtown' },
      { name: 'Store B', description: 'Retail location uptown' }
    ];
    
    locations.forEach(async (loc) => {
      await this.createLocation(loc);
    });
    
    // Create products
    const products = [
      { 
        name: 'Dell XPS 13 Laptop', 
        sku: 'DXPS-13-9380', 
        description: 'Dell XPS 13 9380, 16GB RAM, 512GB SSD', 
        categoryId: 1, 
        unitCost: 1200, 
        minStockLevel: 10 
      },
      { 
        name: 'iPhone 13 Pro', 
        sku: 'IP13-PRO-256', 
        description: '256GB, Graphite', 
        categoryId: 1, 
        unitCost: 999, 
        minStockLevel: 15 
      },
      { 
        name: 'Samsung QLED TV', 
        sku: 'SAMS-TV-Q55', 
        description: '55", 4K UHD', 
        categoryId: 1, 
        unitCost: 850, 
        minStockLevel: 8 
      },
      { 
        name: 'Sony WH-1000XM4', 
        sku: 'SONY-WH1000XM4', 
        description: 'Wireless noise-canceling headphones', 
        categoryId: 1, 
        unitCost: 299, 
        minStockLevel: 12 
      },
      { 
        name: 'Office Desk', 
        sku: 'DESK-OAK-48', 
        description: '48" Oak Office Desk', 
        categoryId: 2, 
        unitCost: 350, 
        minStockLevel: 5 
      }
    ];
    
    products.forEach(async (prod) => {
      await this.createProduct(prod);
    });
    
    // Create inventory
    const inventoryItems = [
      { productId: 1, locationId: 1, quantity: 24 },  // Dell XPS at Warehouse A
      { productId: 2, locationId: 3, quantity: 8 },   // iPhone at Store A
      { productId: 3, locationId: 2, quantity: 0 },   // Samsung TV at Warehouse B
      { productId: 4, locationId: 3, quantity: 2 },   // Sony Headphones at Store A
      { productId: 5, locationId: 1, quantity: 15 }   // Office Desk at Warehouse A
    ];
    
    inventoryItems.forEach(async (inv) => {
      await this.createInventoryItem(inv);
    });
    
    // Create stock movements
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const movements = [
      { 
        productId: 1, 
        locationId: 1, 
        quantity: 25, 
        note: 'Initial stock', 
        timestamp: lastWeek 
      },
      { 
        productId: 2, 
        locationId: 3, 
        quantity: 12, 
        note: 'Initial stock', 
        timestamp: lastWeek 
      },
      { 
        productId: 2, 
        locationId: 3, 
        quantity: -5, 
        note: 'Sales', 
        timestamp: yesterday 
      },
      { 
        productId: 3, 
        locationId: 2, 
        quantity: 5, 
        note: 'Initial stock', 
        timestamp: lastWeek 
      },
      { 
        productId: 3, 
        locationId: 2, 
        quantity: -5, 
        note: 'Transferred to Store B', 
        timestamp: yesterday 
      },
      { 
        productId: 4, 
        locationId: 3, 
        quantity: 15, 
        note: 'Initial stock', 
        timestamp: lastWeek 
      },
      { 
        productId: 4, 
        locationId: 3, 
        quantity: -13, 
        note: 'Sales', 
        timestamp: yesterday 
      },
      { 
        productId: 5, 
        locationId: 1, 
        quantity: 15, 
        note: 'Initial stock', 
        timestamp: lastWeek 
      }
    ];
    
    movements.forEach(async (mov) => {
      const { timestamp, ...movement } = mov;
      const newMovement = await this.createStockMovement(movement);
      // Manually set the timestamp since createStockMovement sets it to now
      this.stockMovements.set(newMovement.id, { ...newMovement, timestamp });
    });
  }
}

export const storage = new MemStorage();
