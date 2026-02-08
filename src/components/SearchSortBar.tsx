import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronDown } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../utils/designTokens';

interface SearchSortBarProps {
  onSearch?: (query: string) => void;
  onSort?: (sortBy: 'recent' | 'name' | 'edited') => void;
  onFilterToggle?: (filter: string) => void;
  activeFilters?: Set<string>;
  isDarkMode?: boolean;
}

export function SearchSortBar({
  onSearch,
  onSort,
  onFilterToggle,
  activeFilters = new Set(),
  isDarkMode = false,
}: SearchSortBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'edited'>('recent');

  const filters = ['Edited', 'Reopened', 'Shared'];

  const sortOptions = [
    { id: 'recent', label: 'Recent' },
    { id: 'name', label: 'Name (A–Z)' },
    { id: 'edited', label: 'Last Edited' },
  ];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSort = (option: 'recent' | 'name' | 'edited') => {
    setSortBy(option);
    onSort?.(option);
    setSortOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{ marginBottom: spacing[8] }}
    >
      {/* Search and Sort Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
          marginBottom: spacing[3],
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            border: '2px solid rgba(128, 128, 128, 0.5)',
            borderRadius: borderRadius.md,
            padding: `${spacing[2]} ${spacing[3]}`,
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
            <img 
              src="/icons/3d/search.svg" 
              alt="Search" 
              style={{ 
                width: '20px', 
                height: '20px', 
                marginRight: spacing[2],
                opacity: 0.7 
              }} 
            />
            <input
              className="search-input"
              style={{
                color: 'var(--text)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                transition: 'color 0.25s',
                flex: 1,
              }}
              placeholder="Search sheets..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <style>
              {`
                .search-input::placeholder {
                  color: var(--muted);
                  opacity: 1;
                  transition: color 0.25s;
                }
              `}
            </style>
        </div>

        {/* Sort Dropdown */}
        <div style={{ position: 'relative' }}>
          <motion.button
            onClick={() => setSortOpen(!sortOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#000000',
              background: 'rgba(255, 207, 64, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              transition: transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFD700';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 207, 64, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            Sort: {sortOptions.find((o) => o.id === sortBy)?.label}
            <ChevronDown size={16} strokeWidth={2.5} style={{ transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '200ms', filter: 'drop-shadow(0 2px 4px rgba(255, 207, 64, 0.3))' }} />
          </motion.button>

          {/* Dropdown Menu */}
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: spacing[2],
                background: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 207, 64, 0.15)' : 'rgba(255, 207, 64, 0.2)'}`,
                borderRadius: borderRadius.md,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isDarkMode ? 'rgba(0, 0, 0, 0.3) 0 10px 15px -3px' : 'rgba(0, 0, 0, 0.05) 0 10px 15px -3px',
                zIndex: 50,
                minWidth: '150px',
              }}
            >
              {sortOptions.map((option, index) => (
                <button
                  key={option.id}
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('border', '1px solid #000000', 'important');
                      el.style.setProperty('border-left', '1px solid #000000', 'important');
                      el.style.setProperty('border-right', '1px solid #000000', 'important');
                      el.style.setProperty('border-top', index === 0 ? '1px solid #000000' : '0px', 'important');
                      el.style.setProperty('border-bottom', '1px solid #000000', 'important');
                      el.style.setProperty('box-sizing', 'border-box', 'important');
                    }
                  }}
                  onClick={() => handleSort(option.id as 'recent' | 'name' | 'edited')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    color: '#000000',
                    background: sortBy === option.id ? '#FFD700' : '#FFCF40',
                    cursor: 'pointer',
                    transition: transitions.fast,
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFD700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = sortBy === option.id ? '#FFD700' : '#FFCF40';
                  }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: spacing[2],
          flexWrap: 'wrap',
        }}
      >
        {filters.map((filter) => {
          const isActive = activeFilters.has(filter);
          return (
            <motion.button
              key={filter}
              onClick={() => onFilterToggle?.(filter)}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: borderRadius.full,
                border: `2px solid ${isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'}`,
                background: isActive ? '#FFD700' : 'rgba(255, 207, 64, 0.6)',
                color: '#000000',
                cursor: 'pointer',
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.background = '#FFD700';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.background = isActive ? '#FFD700' : 'rgba(255, 207, 64, 0.6)';
                e.currentTarget.style.color = '#000000';
              }}
            >
              {filter}
            </motion.button>
          );
        })}
      </div>
      <style>{`
        .dark-placeholder::placeholder {
          color: var(--muted);
          opacity: 1;
        }
        .light-placeholder::placeholder {
          color: rgba(0,0,0,0.5);
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
}
