import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface NavProps {
  NavArray: Navigation[];
}

interface Navigation {
  name: string;
  path: string;
  status: boolean;
}

const TopNavigation: React.FC<NavProps> = ({ NavArray }) => {
  const pathname = usePathname();

  return (
    <div className='flex flex-row items-center justify-start gap-1 sm:gap-2'>
      {NavArray.map((nav, index) => (
        <React.Fragment key={index}>
          {nav.status ? (
            <Link
              href={nav.path}
              className={`text-[14px] sm:text-[16px] font-[500] cursor-pointer transition-colors
                ${pathname === nav.path ? 'text-[#3E206D]' : 'text-[#3E206D]/70 hover:text-[#3E206D]'}
              `}
            >
              {nav.name}
            </Link>
          ) : (
            <span
              className={`text-[14px] sm:text-[16px] font-[500] text-[#3E206D]/30 cursor-not-allowed`}
            >
              {nav.name}
            </span>
          )}
          {index !== NavArray.length - 1 && (
            <span className='text-[#3E206D]/50 text-[14px] sm:text-[16px] font-[500] px-1'>
              <ChevronRight size={16} />
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TopNavigation;