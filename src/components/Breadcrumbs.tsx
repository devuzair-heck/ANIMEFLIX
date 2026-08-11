import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-2 text-xs text-neutral-400 flex-wrap ${className}`} aria-label="Breadcrumb">
      <Link to="/" className="inline-flex items-center gap-1 hover:text-white transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            {item.path && !isLast ? (
              <Link to={item.path} className="hover:text-white transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[200px] sm:max-w-xs ${isLast ? 'text-white font-bold' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
