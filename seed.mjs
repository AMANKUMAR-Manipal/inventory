import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Default data
const defaultCategories = [
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Office Supplies", description: "Office stationery and supplies" },
  { name: "Furniture", description: "Office and home furniture" }
];

const defaultLocations = [
  { name: "Warehouse A", description: "Main storage facility" },
  { name: "Warehouse B", description: "Secondary storage" },
  { name: "Retail Store", description: "Main retail location" }
];

const defaultProducts = [
  { 
    name: "Dell XPS 13 Laptop", 
    sku: "DXPS-13-9310", 
    description: "13-inch premium laptop with Intel Core i7", 
    categoryId: 1, // Electronics
    unitCost: 1299.99,
    minStockLevel: 5
  },
  { 
    name: "HP LaserJet Printer", 
    sku: "HP-LJ-P2035", 
    description: "Monochrome laser printer", 
    categoryId: 1, // Electronics
    unitCost: 349.99,
    minStockLevel: 3
  },
  { 
    name: "Office Chair", 
    sku: "OFC-CH-ERG1", 
    description: "Ergonomic office chair with lumbar support", 
    categoryId: 3, // Furniture
    unitCost: 199.99,
    minStockLevel: 10
  },
  { 
    name: "Paper Ream", 
    sku: "PAPER-A4-500", 
    description: "500 sheets of A4 paper", 
    categoryId: 2, // Office Supplies
    unitCost: 4.99,
    minStockLevel: 50
  },
  { 
    name: "Whiteboard", 
    sku: "WB-MAGN-36X48", 
    description: "36x48 inch magnetic whiteboard", 
    categoryId: 2, // Office Supplies
    unitCost: 79.99,
    minStockLevel: 8
  }
];

// Inventory items will be created after products and locations
const defaultInventory = [
  { productId: 1, locationId: 1, quantity: 12 }, // Dell XPS in Warehouse A
  { productId: 1, locationId: 3, quantity: 3 },  // Dell XPS in Retail Store
  { productId: 2, locationId: 1, quantity: 8 },  // HP Printer in Warehouse A
  { productId: 3, locationId: 2, quantity: 15 }, // Office Chair in Warehouse B
  { productId: 4, locationId: 1, quantity: 120 }, // Paper in Warehouse A
  { productId: 4, locationId: 3, quantity: 25 },  // Paper in Retail Store
  { productId: 5, locationId: 2, quantity: 4 }    // Whiteboard in Warehouse B
];

// Stock movements based on inventory
const defaultMovements = [
  { productId: 1, locationId: 1, quantity: 15, note: "Initial stock" },
  { productId: 1, locationId: 1, quantity: -3, note: "Shipped to customer" },
  { productId: 2, locationId: 1, quantity: 10, note: "Initial stock" },
  { productId: 2, locationId: 1, quantity: -2, note: "Defective returns" },
  { productId: 3, locationId: 2, quantity: 20, note: "Initial stock" },
  { productId: 3, locationId: 2, quantity: -5, note: "Moved to showroom" },
  { productId: 4, locationId: 1, quantity: 200, note: "Bulk purchase" },
  { productId: 4, locationId: 1, quantity: -80, note: "Monthly consumption" },
  { productId: 5, locationId: 2, quantity: 10, note: "Initial stock" },
  { productId: 5, locationId: 2, quantity: -6, note: "Sold to office supplies store" }
];

async function seed() {
  try {
    console.log("Starting database seed...");
    
    // Insert categories
    console.log("Inserting categories...");
    for (const category of defaultCategories) {
      await db.insert(schema.categories).values(category).onConflictDoNothing();
    }
    
    // Insert locations
    console.log("Inserting locations...");
    for (const location of defaultLocations) {
      await db.insert(schema.locations).values(location).onConflictDoNothing();
    }
    
    // Insert products
    console.log("Inserting products...");
    for (const product of defaultProducts) {
      await db.insert(schema.products).values(product).onConflictDoNothing();
    }
    
    // Insert inventory items
    console.log("Inserting inventory items...");
    for (const item of defaultInventory) {
      // Check if inventory exists
      const existing = await db.select()
        .from(schema.inventory)
        .where(
          eq(schema.inventory.productId, item.productId) &&
          eq(schema.inventory.locationId, item.locationId)
        );
      
      if (existing.length === 0) {
        await db.insert(schema.inventory).values({
          ...item,
          updatedAt: new Date()
        });
      }
    }
    
    // Insert stock movements
    console.log("Inserting stock movements...");
    for (const movement of defaultMovements) {
      await db.insert(schema.stockMovements).values({
        ...movement,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
      }).onConflictDoNothing();
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

seed();
