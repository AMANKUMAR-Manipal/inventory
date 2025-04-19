import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  PlusIcon, 
  Pencil, 
  Trash, 
  MapPinIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import LocationForm from "@/components/LocationForm";
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
import type { Location } from "@shared/schema";

export default function LocationsPage() {
  const { toast } = useToast();
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<{ id: number; data: Location } | null>(null);
  
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationFormOpen(true);
  };
  
  const handleEditLocation = (location: Location) => {
    setEditingLocation({ id: location.id, data: location });
    setLocationFormOpen(true);
  };
  
  const handleDeleteLocation = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/locations/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      toast({
        title: "Success",
        description: "Location has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location. It may have inventory items.",
        variant: "destructive",
      });
    }
  };
  
  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "name",
      header: "Location Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <MapPinIcon className="h-5 w-5" />
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
              onClick={() => handleEditLocation(row.original)}
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
                    Are you sure you want to delete the location "{row.original.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteLocation(row.original.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage your inventory locations</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={handleAddLocation}
        >
          <PlusIcon className="h-4 w-4" />
          Add Location
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={locations || []}
        searchColumn="name"
        isLoading={isLoading}
      />
      
      <LocationForm
        open={locationFormOpen}
        onOpenChange={setLocationFormOpen}
        locationId={editingLocation?.id}
        initialData={editingLocation?.data}
      />
    </div>
  );
}
