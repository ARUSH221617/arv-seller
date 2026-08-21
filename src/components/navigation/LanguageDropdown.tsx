import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '../../i18n';
import { SupportedLanguage } from '../../types';
import { cn } from '../../lib/utils';

interface LanguageDropdownProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 hover:border-arvan-teal/40 focus:outline-none focus:ring-2 focus:ring-arvan-teal shadow-sm',
          isOpen && 'border-arvan-teal/60 bg-slate-50'
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.nativeName}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-arvan-teal')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-arvan-teal" />
            <span>Select Language</span>
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isSelected && 'bg-arvan-teal/10 text-arvan-teal-dark font-semibold'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-arvan-teal" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
