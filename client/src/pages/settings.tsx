import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  UserIcon, 
  KeyIcon, 
  Settings2Icon, 
  BellIcon,
  InfoIcon
} from "lucide-react";

// Form schema for general settings
const generalFormSchema = z.object({
  defaultMinStockLevel: z.string().min(1).transform(val => parseInt(val)),
  defaultStockUnitName: z.string().min(1),
  pageSize: z.string().min(1).transform(val => parseInt(val)),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

// Form schema for user settings
const userFormSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  notifications: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings form
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      defaultMinStockLevel: "10",
      defaultStockUnitName: "units",
      pageSize: "10",
    },
  });
  
  // User settings form
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "John Doe",
      email: "john.doe@example.com",
      notifications: true,
    },
  });
  
  // Handle general settings submit
  const onGeneralSubmit = (values: GeneralFormValues) => {
    console.log(values);
    toast({
      title: "Settings Updated",
      description: "Your general settings have been saved.",
    });
  };
  
  // Handle user settings submit
  const onUserSubmit = (values: UserFormValues) => {
    console.log(values);
    toast({
      title: "Profile Updated",
      description: "Your user profile has been saved.",
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2Icon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            User Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="defaultMinStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Minimum Stock Level</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormDescription>
                          Default minimum stock level for new products
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="defaultStockUnitName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Stock Unit Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Default unit name for stock (e.g., units, items, pieces)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="pageSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Items Per Page</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select page size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">10 items</SelectItem>
                            <SelectItem value="20">20 items</SelectItem>
                            <SelectItem value="50">50 items</SelectItem>
                            <SelectItem value="100">100 items</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Number of items to display per page in tables
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center pt-4">
                    <Button type="submit">Save Settings</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your user profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  <FormField
                    control={userForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <UserIcon className="h-4 w-4" />
                            </span>
                            <Input {...field} className="rounded-l-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <InfoIcon className="h-4 w-4" />
                            </span>
                            <Input {...field} type="email" className="rounded-l-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Notifications
                          </FormLabel>
                          <FormDescription>
                            Receive notifications about low stock and inventory changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary">
                            <BellIcon className="h-4 w-4 text-primary" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center pt-4">
                    <Button type="submit">Save Profile</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your password to maintain account security
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="current-password" className="text-sm font-medium">
                      Current Password
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <KeyIcon className="h-4 w-4" />
                      </span>
                      <Input
                        id="current-password"
                        type="password"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="new-password" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <KeyIcon className="h-4 w-4" />
                      </span>
                      <Input
                        id="new-password"
                        type="password"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <KeyIcon className="h-4 w-4" />
                      </span>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
