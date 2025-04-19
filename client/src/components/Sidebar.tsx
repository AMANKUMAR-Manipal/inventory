import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  ArchiveIcon,
  BarChart3Icon,
  LayoutDashboardIcon,
  MapPinIcon,
  PackageIcon,
  Settings2Icon,
  StoreIcon,
  TagIcon,
  UploadIcon,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboardIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: <ArchiveIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Products",
    href: "/products",
    icon: <PackageIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: <TagIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Locations",
    href: "/locations",
    icon: <MapPinIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart3Icon className="mr-2 h-4 w-4" />,
  },
];

const settingsItems = [
  {
    title: "General",
    href: "/settings",
    icon: <Settings2Icon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Import/Export",
    href: "/import-export",
    icon: <UploadIcon className="mr-2 h-4 w-4" />,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <StoreIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
        </div>
      </div>

      <nav className="px-4 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg font-medium",
                    location === item.href
                      ? "bg-blue-50 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <ul className="mt-3 space-y-1">
            {settingsItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg",
                      location === item.href
                        ? "bg-blue-50 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
