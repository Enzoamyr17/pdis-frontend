import Image from "next/image";
import { ChevronDown, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-light to-blue h-18 flex items-center justify-between px-12">
      <div className="flex items-center justify-center">
        <Image src="/assets/pd/colored_wide_text.png" alt="logo" width={300} height={10} />
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
  );
} 