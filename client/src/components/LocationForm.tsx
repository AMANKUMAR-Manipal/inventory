import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Form schema for location
const formSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId?: number; // If provided, we're editing an existing location
  initialData?: {
    name: string;
    description?: string;
  };
}

export default function LocationForm({ 
  open, 
  onOpenChange, 
  locationId, 
  initialData 
}: LocationFormProps) {
  const { toast } = useToast();
  const isEditing = !!locationId;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Set form values when editing an existing location
  useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [form, isEditing, initialData, open]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await apiRequest('PUT', `/api/locations/${locationId}`, values);
        toast({
          title: "Success",
          description: "Location has been updated successfully.",
        });
      } else {
        await apiRequest('POST', '/api/locations', values);
        toast({
          title: "Success",
          description: "Location has been created successfully.",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the location information below." : "Fill out the form below to add a new location."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3} 
                      placeholder="Location description..."
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
                {isEditing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
