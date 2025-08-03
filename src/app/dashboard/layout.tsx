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
import { signOut } from "next-auth/react"
import { useOptimizedSession, clearSessionCache } from "@/hooks/useOptimizedSession"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
  Database,
  Car,
  FileText,
  DoorOpen,
  Hammer,
  Plane,
  MessageSquare,
  ShoppingCart,
  PhilippinePeso,
  PieChart,
  Megaphone,
  Target,
  UserCheck,
  Building,
  IdCard,
  Clipboard,
  Palette,
  BookOpen,
  Building2
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from "next/image"
// import { usePathname } from "next/navigation" // Currently unused
import { useState } from "react"
import { useModule, ModuleProvider } from "@/contexts/ModuleContext"
import { moduleRegistry } from "@/components/modules/ModuleRegistry"
// Menu items for the sidebar

const serviceCenterItems = [
  {
    title: "Request to Pay",
    moduleId: "purchase-request",
    icon: ShoppingCart,
    disabled: false,
  },
  {
    title: "Cash Advance",
    moduleId: "br-cash-advance",
    icon: PhilippinePeso,
    disabled: false,
  },
  {
    title: "Reimbursement",
    moduleId: "br-reimbursement",
    icon: PhilippinePeso,
    disabled: false,
  },
  {
    title: "IM Clearance Form",
    moduleId: "im-clearance-form",
    icon: FileText,
    disabled: false,
  },
  {
    title: "JO for Messengerial Service",
    moduleId: "joms",
    icon: MessageSquare,
    disabled: false,
  },
  {
    title: "Vehicle Req",
    moduleId: "vehicle-requisition",
    icon: Car,
    disabled: false,
  },
  {
    title: "Flight Booking",
    moduleId: "flight-booking",
    icon: Plane,
    disabled: false,
  },
  {
    title: "Gate Pass In out",
    moduleId: "gate-pass",
    icon: DoorOpen,
    disabled: true,
  },
  {
    title: "Equipment Rental",
    moduleId: "equipment-rental",
    icon: Wrench,
    disabled: true,
  },
  {
    title: "Fabrication",
    moduleId: "fabrication-request",
    icon: Hammer,
    disabled: true,
  },
]

const genAdTools = [
  {
    title: "GenAd PEP",
    moduleId: "opex-budget",
    icon: PieChart,
    disabled: false,
  },
  {
    title: "PD Bulletins",
    moduleId: "bulletins-advisories",
    icon: Megaphone,
    disabled: false,
  },
  {
    title: "User Management",
    moduleId: "user-creation",
    icon: UserCheck,
    disabled: false,
  },
  {
    title: "IM Management",
    moduleId: "im-registration",
    icon: IdCard,
    disabled: false,
  },
  {
    title: "Client Management",
    moduleId: "client-registration",
    icon: Building,
    disabled: false,
  },
  {
    title: "Vendor Management",
    moduleId: "vendor-management",
    icon: Building2,
    disabled: false,
  },
  {
    title: "Performance Management",
    moduleId: "performance-management",
    icon: Target,
    disabled: true,
  },
]

const genOpsTools = [
  {
    title: "Client Management",
    moduleId: "genops-client-management",
    icon: Building,
    disabled: false,
  },
  {
    title: "GenOps PEP",
    moduleId: "creation-of-pep",
    icon: Clipboard,
    disabled: false,
  },
  {
    title: "Creatives JO",
    moduleId: "creation-of-jo",
    icon: Palette,
    disabled: true,
  },
]

const pdDirectoryItems = [
  {
    title: "Client",
    moduleId: "pd-directory-client",
    icon: Building,
    disabled: false,
  },
  {
    title: "Vendor",
    moduleId: "pd-directory-vendor",
    icon: Building2,
    disabled: false,
  },
  {
    title: "User",
    moduleId: "pd-directory-user",
    icon: Users,
    disabled: false,
  },
  {
    title: "IM",
    moduleId: "pd-directory-im",
    icon: IdCard,
    disabled: false,
  },
]

const reportsItems = [
  {
    title: "System Reports",
    moduleId: "system-reports",
    icon: FileBarChart,
    disabled: false,
  },
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
    url: "https://app.greatdayhr.com/features/home/home-web",
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
  // const pathname = usePathname() // Currently unused
  const router = useRouter()
  const { data: session, status } = useOptimizedSession()
  const { activeModule, setActiveModule } = useModule()
  const [isServiceCenterOpen, setIsServiceCenterOpen] = useState(false)
  const [isGenAdToolsOpen, setIsGenAdToolsOpen] = useState(false)
  const [isGenOpsToolsOpen, setIsGenOpsToolsOpen] = useState(false)
  const [isPdDirectoryOpen, setIsPdDirectoryOpen] = useState(false)
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  useEffect(() => {
    if (status === "loading") return
    
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (session?.user && !session.user.profileCompleted) {
      router.push("/auth/complete-profile")
      return
    }
  }, [session, status, router])

  const handleLogout = async () => {
    // Clear session cache before signing out
    clearSessionCache()
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user?.profileCompleted) {
    return null
  }


  const handleModuleClick = (moduleId: string) => {
    const moduleData = moduleRegistry[moduleId]
    if (moduleData) {
      setActiveModule(moduleData)
    }
  }

  const handleLogoClick = () => {
    setActiveModule(null)
  }

  return (
    <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
      <Sidebar className="p-2 shadow-toolbar z-40">
          <SidebarHeader className="border-b border-sidebar-border min-h-[3rem] max-h-[3rem] flex items-center justify-center">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                <Image className={`${isCollapsed ? "hidden" : "block"} min-w-[240px]`} src="/assets/pd/colored_wide_logo_3-01.png" alt="logo" width={240} height={37} />
                <Image className={`${isCollapsed ? "block" : "hidden"}`} src="/assets/pd/colored_square_logo.png" alt="logo" width={50} height={50} />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem className="flex flex-col">
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => {setIsServiceCenterOpen(!isServiceCenterOpen);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isServiceCenterOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                              <Cog className="w-5 h-5" />
                              <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>Service Center</h1>
                              <ChevronDown className={`w-5 h-5 ${isServiceCenterOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[300px]">
                            <p>Service Center - Request forms and administrative services</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button onClick={() => {setIsServiceCenterOpen(!isServiceCenterOpen);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isServiceCenterOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                          <Cog className="w-5 h-5" />
                          <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>Service Center</h1>
                          <ChevronDown className={`w-5 h-5 ${isServiceCenterOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                        </button>
                      )}
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isServiceCenterOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {serviceCenterItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton 
                                  onClick={() => !item.disabled && handleModuleClick(item.moduleId)} 
                                  className={`font-medium transition-all duration-200 ${
                                    item.disabled 
                                      ? "text-gray-400 cursor-not-allowed" 
                                      : activeModule?.id === item.moduleId 
                                        ? "bg-blue/20 text-blue border-l-4 border-blue cursor-pointer" 
                                        : "text-blue/80 hover:bg-blue/10 cursor-pointer"
                                  }`}
                                >
                                  {isCollapsed && <IconComponent className="w-4 h-4" />}
                                  <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.title}</span>
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
                    <SidebarMenuItem className="flex flex-col">
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => {setIsGenAdToolsOpen(!isGenAdToolsOpen);setIsServiceCenterOpen(false);setIsGenOpsToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenAdToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                              <Wrench className="w-5 h-5" />
                              <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenAd Tools</h1>
                              <ChevronDown className={`w-5 h-5 ${isGenAdToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[300px]">
                            <p>GenAd Tools - General Administration management and monitoring tools</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button onClick={() => {setIsGenAdToolsOpen(!isGenAdToolsOpen);setIsServiceCenterOpen(false);setIsGenOpsToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenAdToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                          <Wrench className="w-5 h-5" />
                          <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenAd Tools</h1>
                          <ChevronDown className={`w-5 h-5 ${isGenAdToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                        </button>
                      )}
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenAdToolsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {genAdTools.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton 
                                  onClick={() => !item.disabled && handleModuleClick(item.moduleId)} 
                                  className={`font-medium transition-all duration-200 ${
                                    item.disabled 
                                      ? "text-gray-400 cursor-not-allowed" 
                                      : activeModule?.id === item.moduleId 
                                        ? "bg-blue/20 text-blue border-l-4 border-blue cursor-pointer" 
                                        : "text-blue/80 hover:bg-blue/10 cursor-pointer"
                                  }`}
                                >
                                  {isCollapsed && <IconComponent className="w-4 h-4" />}
                                  <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.title}</span>
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
                    <SidebarMenuItem className="flex flex-col">
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => {setIsGenOpsToolsOpen(!isGenOpsToolsOpen);setIsServiceCenterOpen(false);setIsGenAdToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenOpsToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                              <Wrench className="w-5 h-5" />
                              <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenOps Tools</h1>
                              <ChevronDown className={`w-5 h-5 ${isGenOpsToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[300px]">
                            <p>GenOps Tools - General Operations creation and management tools</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button onClick={() => {setIsGenOpsToolsOpen(!isGenOpsToolsOpen);setIsServiceCenterOpen(false);setIsGenAdToolsOpen(false);setIsPdDirectoryOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isGenOpsToolsOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                          <Wrench className="w-5 h-5" />
                          <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>GenOps Tools</h1>
                          <ChevronDown className={`w-5 h-5 ${isGenOpsToolsOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                        </button>
                      )}
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenOpsToolsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {genOpsTools.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton 
                                  onClick={() => !item.disabled && handleModuleClick(item.moduleId)} 
                                  className={`font-medium transition-all duration-200 ${
                                    item.disabled 
                                      ? "text-gray-400 cursor-not-allowed" 
                                      : activeModule?.id === item.moduleId 
                                        ? "bg-blue/20 text-blue border-l-4 border-blue cursor-pointer" 
                                        : "text-blue/80 hover:bg-blue/10 cursor-pointer"
                                  }`}
                                >
                                  {isCollapsed && <IconComponent className="w-4 h-4" />}
                                  <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.title}</span>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[300px]">
                                <p>{item.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                        <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isGenOpsToolsOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                          {reportsItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Tooltip key={item.title}>
                                <TooltipTrigger asChild>
                                  <SidebarMenuButton 
                                    onClick={() => !item.disabled && handleModuleClick(item.moduleId)} 
                                    className={`font-medium transition-all duration-200 ${
                                      item.disabled 
                                        ? "text-gray-400 cursor-not-allowed" 
                                        : activeModule?.id === item.moduleId 
                                          ? "bg-blue/20 text-blue border-l-4 border-blue cursor-pointer" 
                                          : "text-blue/80 hover:bg-blue/10 cursor-pointer"
                                    }`}
                                  >
                                    {isCollapsed && <IconComponent className="w-4 h-4" />}
                                    <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.title}</span>
                                  </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[300px]">
                                  <p>{item.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="flex flex-col">
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => {setIsPdDirectoryOpen(!isPdDirectoryOpen);setIsServiceCenterOpen(false);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isPdDirectoryOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                              <BookOpen className="w-5 h-5" />
                              <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>PD Directory</h1>
                              <ChevronDown className={`w-5 h-5 ${isPdDirectoryOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[300px]">
                            <p>PD Directory - Client, Vendor, User, and IM directories</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button onClick={() => {setIsPdDirectoryOpen(!isPdDirectoryOpen);setIsServiceCenterOpen(false);setIsGenAdToolsOpen(false);setIsGenOpsToolsOpen(false)}} className={`flex items-center justify-between overflow-hidden ${isPdDirectoryOpen ? "bg-orange/80" : "bg-orange/0"} hover:bg-blue/80 text-blue hover:text-white p-2 rounded-lg cursor-pointer transition-all duration-300`}>
                          <BookOpen className="w-5 h-5" />
                          <h1 className={`text-medium ${isCollapsed ? "hidden" : "block"} transition-all duration-500`}>PD Directory</h1>
                          <ChevronDown className={`w-5 h-5 ${isPdDirectoryOpen ? "-rotate-180" : "rotate-0"} transition-all duration-500 ${isCollapsed ? "hidden" : "block"} transition-all duration-500`} />
                        </button>
                      )}
                      <div className={`flex flex-col gap-0 h-auto overflow-hidden ${isPdDirectoryOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-500`}>
                        {pdDirectoryItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Tooltip key={item.title}>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton 
                                  onClick={() => !item.disabled && handleModuleClick(item.moduleId)} 
                                  className={`font-medium transition-all duration-200 ${
                                    item.disabled 
                                      ? "text-gray-400 cursor-not-allowed" 
                                      : activeModule?.id === item.moduleId 
                                        ? "bg-blue/20 text-blue border-l-4 border-blue cursor-pointer" 
                                        : "text-blue/80 hover:bg-blue/10 cursor-pointer"
                                  }`}
                                >
                                  {isCollapsed && <IconComponent className="w-4 h-4" />}
                                  <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.title}</span>
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
        <header className="z-40 w-full bg-orange flex items-center justify-between pl-0 pr-12 text-white min-h-[3.5rem] max-h-[3.5rem]">
            <div className="flex items-center justify-center h-full w-auto aspect-square">
                <SidebarTrigger className="text-blue hover:bg-blue transition-all duration-300" />
            </div>
            <div className="flex items-center justify-center">
                <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 border-2 border-transparent hover:bg-white/20 px-4 py-1 rounded-xl transition-all duration-300">
                    <User className="w-6 h-6" />
                    
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
      <ModuleProvider>
        <DashboardContent>{children}</DashboardContent>
      </ModuleProvider>
    </SidebarProvider>
  )
}