import React, { useState, useEffect, useRef } from 'react';

interface DropdownProps {
  buttonLabel: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ buttonLabel, buttonProps, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          {...buttonProps}
        >
          {icon}
          {buttonLabel}
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {React.Children.map(children, child =>
              React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { closeMenu: () => setIsOpen(false) }) : child
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  onSelect: () => void;
  children: React.ReactNode;
  closeMenu?: () => void; // Injected by parent
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ onSelect, children, closeMenu }) => {
  const handleSelect = () => {
    onSelect();
    if (closeMenu) {
      closeMenu();
    }
  };

  return (
    <button
      onClick={handleSelect}
      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      role="menuitem"
    >
      {children}
    </button>
  );
};