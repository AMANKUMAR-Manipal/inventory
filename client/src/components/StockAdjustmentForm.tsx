import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Location } from "@shared/schema";

// Form schema for stock adjustment
const formSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  locationId: z.string().min(1, "Location is required"),
  quantity: z.string().min(1, "Quantity is required").transform(val => parseInt(val)),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryId?: number; // If provided, we're editing an existing inventory item
  productId?: number; // If provided, we're pre-selecting a product
  initialData?: {
    productId: number;
    locationId: number;
    quantity: number;
    currentQuantity?: number;
    note?: string;
  };
}

export default function StockAdjustmentForm({ 
  open, 
  onOpenChange, 
  inventoryId,
  productId: preSelectedProductId,
  initialData 
}: StockAdjustmentFormProps) {
  const { toast } = useToast();
  const isEditing = !!inventoryId;
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: locations } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: preSelectedProductId ? String(preSelectedProductId) : "",
      locationId: "",
      quantity: "",
      note: "",
    },
  });
  
  // Set form values when editing an existing inventory item or pre-selecting a product
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        form.reset({
          productId: String(initialData.productId),
          locationId: String(initialData.locationId),
          // When editing, show quantity difference as 0 by default
          quantity: "0",
          note: initialData.note || "",
        });
      } else if (preSelectedProductId) {
        form.reset({
          productId: String(preSelectedProductId),
          locationId: "",
          quantity: "",
          note: "",
        });
      } else {
        form.reset({
          productId: "",
          locationId: "",
          quantity: "",
          note: "",
        });
      }
    }
  }, [form, isEditing, initialData, preSelectedProductId, open]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        productId: parseInt(values.productId),
        locationId: parseInt(values.locationId),
        quantity: values.quantity,
        note: values.note || (values.quantity > 0 ? "Stock added" : "Stock removed"),
      };
      
      await apiRequest('POST', '/api/stock-movements', payload);
      
      toast({
        title: "Success",
        description: "Stock has been adjusted successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Get current quantity if editing
  const currentQuantity = initialData?.currentQuantity || 0;
  const watchedQuantity = form.watch("quantity");
  const newQuantity = currentQuantity + (parseInt(watchedQuantity) || 0);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Update inventory quantity for a product. Use positive values to add stock and negative values to remove stock.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!!preSelectedProductId || isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem 
                          key={product.id} 
                          value={String(product.id)}
                        >
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem 
                          key={location.id} 
                          value={String(location.id)}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Change</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  {isEditing && (
                    <FormDescription>
                      Current quantity: {currentQuantity}. New quantity will be: {newQuantity}
                    </FormDescription>
                  )}
                  <FormDescription>
                    Use positive numbers to add stock and negative numbers to remove stock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3} 
                      placeholder="Optional note about this stock adjustment..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
