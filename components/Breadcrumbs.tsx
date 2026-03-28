import Link from 'next/link';
import { HiChevronRight, HiHome } from 'react-icons/hi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500">
        {/* Always start with Home */}
        <li className="flex items-center">
          <Link href="/" className="hover:text-orange-600 flex items-center gap-1 transition-colors">
            <HiHome className="text-lg" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <HiChevronRight className="text-gray-500 shrink-0" />
            {item.href ? (
              <Link 
                href={item.href} 
                className="hover:text-orange-600 transition-colors capitalize"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-orange-600 font-bold truncate max-w-[150px] sm:max-w-none capitalize">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}