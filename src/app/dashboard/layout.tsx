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
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { 
  Wrench,
  Cog,
  ChevronDown,
  User,
  FileBarChart,
  Globe,
  Facebook,
  Instagram,
  Users,
  Database
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
// Menu items for the sidebar

const genAdServices = [
  {
    title: "Supplies Requisition",
    url: "#",
  },
  {
    title: "Vehicle Requisition",
    url: "#",
  },
  {
    title: "IM Clearance Form (Independent Manpowers)",
    url: "#",
  },
  {
    title: "Gate Pass In / Gate Pass Out",
    url: "#",
  },
  {
    title: "Equipment Rental",
    url: "#",
  },
  {
    title: "Fabrication / Refurbishing Request",
    url: "#",
  },
  {
    title: "Flight Booking Requisition",
    url: "#",
  },
  {
    title: "JO for Messengerial Service (JOMS)",
    url: "#",
  },
  {
    title: "Purchase Request (with SAP Tracker)",
    url: "#",
  },
  {
    title: "BR Cash Advance",
    url: "#",
  },
  {
    title: "BR Reimbursement",
    url: "#",
  },
]

const genAdTools = [
  {
    title: "OPEX Budget (GenAd PEP)",
    url: "#",
  },
  {
    title: "Bulletins, Advisories, Policies",
    url: "#",
  },
  {
    title: "Performance Management",
    url: "#",
  },
  {
    title: "User Creation (Org Chart)",
    url: "#",
  },
  {
    title: "Client Registration",
    url: "#",
  },
  {
    title: "IM Registration",
    url: "#",
  },
  {
    title: "Encoding of New Employees",
    url: "#",
  },
]

const genOpsTools = [
  {
    title: "Creation of JO",
    url: "#",
  },
  {
    title: "Creation of PEP",
    url: "#",
  }
]

const quickLinks = [
  {
    title: "Our Website",
    url: "https://projectduo.com.ph",
    icon: Globe,
  },
  {
    title: "Facebook Page",
    url: "https://www.facebook.com/thisisprojectduo",
    icon: Facebook,
  },
  {
    title: "Instagram Page",
    url: "https://www.instagram.com/thisisprojectduo/",
    icon: Instagram,
  },
  {
    title: "HRIS",
    url: "#",
    icon: Users,
  },
  {
    title: "SAP",
    url: "#",
    icon: Database,
  },
]

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUser()
  const [isGenAdServicesOpen, setIsGenAdServicesOpen] = useState(false)
  const [isGenAdToolsOpen, setIsGenAdToolsOpen] = useState(false)
  const [isGenOpsToolsOpen, setIsGenOpsToolsOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.split(' ')
    if (names.length >= 2) {
      return `${names[0]} ${names[names.length - 1]}`
    }
    return fullName
  }

  return (
    <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
      <Sidebar className="p-2 shadow-inner-red z-40">
          <SidebarHeader className="border-b border-sidebar-border min-h-[3rem] max-h-[3rem] flex items-center justify-center">
            <div className="flex items-center">
                <Image className={`${isCollapsed ? "hidden" : "block"}`} src="/assets/pd/colored_wide_text.png" alt="logo" width={300} height={10} />
                <h1 className={`${isCollapsed ? "block" : "hidden"} font-black text-2xl text-blue`}><span className="text-orange">P</span>D</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem className="flex flex-col">
                      <button onClick={() => {setIsGenAdServicesOpen(!isGenAdServicesOpen);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false);setIsReportsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenAdServicesOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                        <Cog className="w-5 h-5" />
                        <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>Service Center</h1>
                        <ChevronDown className={`w-5 h-5 ${isGenAdServicesOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                      </button>
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenAdServicesOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {genAdServices.map((item) => (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton asChild className="text-blue/80 font-medium">
                                  <a href={item.url} target="_blank" className="">
                                    <span className="">{item.title}</span>
                                  </a>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[300px]">
                                <p>{item.title}</p>
                              </TooltipContent>
                            </Tooltip>
                        ))}
                      </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="flex flex-col">
                      <button onClick={() => {setIsGenAdToolsOpen(!isGenAdToolsOpen);setIsGenAdServicesOpen(false);setIsGenOpsToolsOpen(false);setIsReportsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenAdToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                        <Wrench className="w-5 h-5" />
                        <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenAd Tools</h1>
                        <ChevronDown className={`w-5 h-5 ${isGenAdToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                      </button>
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenAdToolsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {genAdTools.map((item) => (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton asChild className="text-blue/80 font-medium">
                                  <a href={item.url} target="_blank" className="">
                                    <span className="">{item.title}</span>
                                  </a>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[300px]">
                                <p>{item.title}</p>
                              </TooltipContent>
                            </Tooltip>
                        ))}
                      </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="flex flex-col">
                      <button onClick={() => {setIsGenOpsToolsOpen(!isGenOpsToolsOpen);setIsGenAdServicesOpen(false);setIsGenAdToolsOpen(false);setIsReportsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenOpsToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                        <Wrench className="w-5 h-5" />
                        <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenOps Tools</h1>
                        <ChevronDown className={`w-5 h-5 ${isGenOpsToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                      </button>
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenOpsToolsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {genOpsTools.map((item) => (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton asChild className="text-blue/80 font-medium">
                                  <a href={item.url} target="_blank" className="">
                                    <span className="">{item.title}</span>
                                  </a>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[300px]">
                                <p>{item.title}</p>
                              </TooltipContent>
                            </Tooltip>
                        ))}
                      </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="flex flex-col">
                      <button onClick={() => {setIsReportsOpen(!isReportsOpen);setIsGenAdServicesOpen(false);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isReportsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                        <FileBarChart className="w-5 h-5" />
                        <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>Reports</h1>
                        <ChevronDown className={`w-5 h-5 ${isReportsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                      </button>
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isReportsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {/* Reports content will be added here later */}
                      </div>
                    </SidebarMenuItem>
                  </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  <SidebarMenuItem className={`flex flex-col ${isCollapsed ? "hidden" : "block"}`}>
                    <button onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)} 
                      className={`flex items-center justify-between overflow-hidden ${isQuickLinksOpen ? "bg-slate-100" : "bg-transparent"} hover:bg-slate-50 text-slate-600 hover:text-slate-800 p-2 rounded-md cursor-pointer transition-all duration-200`}>
                      <h1 className="font-normal text-sm">Quick Links</h1>
                      <ChevronDown className={`w-4 h-4 ${isQuickLinksOpen ? "-rotate-180" : "rotate-0"} transition-all duration-300`} />
                    </button>
                    <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isQuickLinksOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-300`}>
                      {quickLinks.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton asChild className="text-slate-500 hover:text-slate-700 font-normal text-sm">
                                <a href={item.url} target="_blank" className="py-1 flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" />
                                  <span className="hover:underline">{item.title}</span>
                                </a>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[300px]">
                              <p>{item.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="max-h-screen overflow-y-auto">
        {/* Header with sidebar trigger */}
        <header className="z-40 w-full bg-gradient-to-r from-light-blue to-blue flex items-center justify-between pl-0 pr-12 text-white min-h-[3.5rem] max-h-[3.5rem]">
            <div className="flex items-center justify-center h-full w-auto aspect-square">
                <SidebarTrigger className="hover:bg-white/20 transition-all duration-300" />
            </div>
            <div className="flex items-center justify-center">
                <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 border-2 border-transparent hover:border-orange px-4 py-1 rounded-xl transition-all duration-100">
                    <User className="w-6 h-6" />
                    <h1 className="font-medium text-lg">{user ? getFirstAndLastName(user.name) : "Guest"}</h1>
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
          
          {/* Main content area */}
          {/* wag galawin ung className !!! */}
          <div className="absolute top-0 left-0 w-full h-full z-30 p-2 pt-16">
            {children}
          </div>
        </SidebarInset>
      </div>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}