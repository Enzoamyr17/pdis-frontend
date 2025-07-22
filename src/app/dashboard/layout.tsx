"use client"

import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { 
  Home, 
  BarChart3, 
  FileText, 
  Settings, 
  Users,
  FolderOpen,
  ChevronDown,
  User
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { usePathname } from "next/navigation"
// Menu items for the sidebar
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: "/dashboard/reports", 
    icon: FileText,
  },
  {
    title: "Team",
    url: "/dashboard/team",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

const quickLinks = [
  {
    title: "Link 1",
    url: "https://google.com",
  },
  {
    title: "Link 2",
    url: "https://google.com",
  },
  {
    title: "Link 3",
    url: "https://google.com",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
        <Sidebar className="p-2 shadow-inner-red">
          <SidebarHeader className="border-b border-sidebar-border min-h-[3rem] max-h-[3rem] flex items-center justify-center">
            <div className="flex items-center">
                <Image src="/assets/pd/colored_wide_text.png" alt="logo" width={300} height={10} />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title} className="flex">
                      <SidebarMenuButton asChild className={`m-auto ${pathname === item.url ? "bg-blue/20 text-black" : ""} hover:bg-orange/80 hover:text-white font-medium text-center transition-all duration-300`}>
                        <a href={item.url} target="_blank" className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 flex">
                  {quickLinks.map((item) => (
                    <SidebarMenuItem key={item.title} className="m-auto">
                      <SidebarMenuButton asChild className="text-blue/50 font-medium">
                        <a href={item.url} target="_blank" className="flex items-center gap-3">
                          <span className="underline">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="max-h-screen overflow-hidden">
        {/* Header with sidebar trigger */}
        <header className="w-full bg-gradient-to-r from-blue-light to-blue flex items-center justify-between pl-0 pr-12 text-white min-h-[3.5rem] max-h-[3.5rem]">
            <div className="flex items-center justify-center h-full w-auto aspect-square">
                <SidebarTrigger className="hover:bg-white/20 transition-all duration-300" />
            </div>
            <div className="flex items-center justify-center">
                <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 border-2 border-transparent hover:border-orange px-4 py-1 rounded-xl transition-all duration-100">
                    <User className="w-6 h-6" />
                    <h1 className="font-medium text-lg">John Doe</h1>
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
          
          {/* Main content area */}
          {/* wag galawin ung className !!! */}
          <div className="flex flex-col h-full p-1">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 