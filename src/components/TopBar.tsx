import { Plus } from "lucide-react";
import { NavTab } from "../types";

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewChat: () => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string }> = [
  { id: "translator", label: "Traduttore Live" },
  { id: "webhook", label: "Webhook API" },
  { id: "extension", label: "Estensione Web" },
  { id: "solutions", label: "Soluzioni Esistenti" },
];

export function TopBar({ activeTab, onSelectTab, onOpenNewChat }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between gap-8">
      {/* Zone 1: Single-element Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab("translator")}
        className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
      >
        LinguaBridge
      </button>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav aria-label="Navigazione principale" className="hidden md:flex items-center gap-7">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                isActive ? "text-teal-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-600"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile compact nav */}
      <nav aria-label="Navigazione mobile" className="flex md:hidden items-center gap-3 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 px-2 py-1.5 rounded ${
                isActive ? "text-teal-700 bg-teal-50" : "text-slate-600"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={onOpenNewChat}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Nuova Chat</span>
        </button>
      </div>
    </header>
  );
}
