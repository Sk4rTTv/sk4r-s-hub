import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function WebsiteMenu() {
  return <Button asChild variant="outline" className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">
    <Link to="/websites"><Globe className="mr-2 h-4 w-4" />Websites</Link>
  </Button>;
}
