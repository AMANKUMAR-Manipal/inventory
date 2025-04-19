import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  PlusIcon, 
  Pencil, 
  Trash, 
  TagIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import CategoryForm from "@/components/CategoryForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@shared/schema";

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: number; data: Category } | null>(null);
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory({ id: category.id, data: category });
    setCategoryFormOpen(true);
  };
  
  const handleDeleteCategory = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. It may be in use by products.",
        variant: "destructive",
      });
    }
  };
  
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <TagIcon className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{row.original.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="text-sm text-gray-500">{row.original.description || "No description"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditCategory(row.original)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the category "{row.original.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteCategory(row.original.id)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={handleAddCategory}
        >
          <PlusIcon className="h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={categories || []}
        searchColumn="name"
        isLoading={isLoading}
      />
      
      <CategoryForm
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        categoryId={editingCategory?.id}
        initialData={editingCategory?.data}
      />
    </div>
  );
}
