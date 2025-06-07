import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      <Link href="/" className="hover:text-primary transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
