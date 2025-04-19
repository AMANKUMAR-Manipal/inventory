import { pgTable, text, serial, integer, timestamp, real, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  description: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  unitCost: real("unit_cost").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  sku: true,
  description: true,
  categoryId: true,
  unitCost: true,
  minStockLevel: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Inventory Items
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.productId, table.locationId),
  };
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  productId: true,
  locationId: true,
  quantity: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Stock Movement History
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  quantity: integer("quantity").notNull(), // Can be negative for removals
  note: text("note"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).pick({
  productId: true,
  locationId: true,
  quantity: true,
  note: true,
});

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

// Users (for completeness, using the existing user structure)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Extended Types for the Frontend
export interface ProductWithDetails extends Product {
  categoryName?: string;
  stockQuantity?: number;
  locationName?: string;
}

export interface InventoryWithDetails extends Inventory {
  productName?: string;
  productSku?: string;
  categoryName?: string;
  locationName?: string;
  minStockLevel?: number;
}

export interface StockMovementWithDetails extends StockMovement {
  productName?: string;
  locationName?: string;
}

export const StockStatus = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock"
} as const;

export type StockStatusType = typeof StockStatus[keyof typeof StockStatus];

// Define relations for better querying
export const categoriesRelations = relations(categories, ({ many }: { many: any }) => ({
  products: many(products),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  inventory: many(inventory),
  stockMovements: many(stockMovements),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventory: many(inventory),
  stockMovements: many(stockMovements),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [inventory.locationId],
    references: [locations.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [stockMovements.locationId],
    references: [locations.id],
  }),
}));
