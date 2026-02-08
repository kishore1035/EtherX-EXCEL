import { useState, useEffect } from "react";
import { X, Search, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { getHelpArticle, searchHelpArticles, trackHelpAction, type HelpArticle } from "../../services/helpService";
import ReactMarkdown from "react-markdown";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  isDarkMode?: boolean;
}

export function HelpPanel({ isOpen, onClose, initialTopic, isDarkMode = false }: HelpPanelProps) {
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen && initialTopic) {
      // Handle search queries
      if (initialTopic.startsWith('search:')) {
        const query = initialTopic.replace('search:', '');
        setSearchQuery(query);
        handleSearch(query);
      } else {
        // Load specific article
        const article = getHelpArticle(initialTopic);
        if (article) {
          setCurrentArticle(article);
          trackHelpAction('view_article', { articleId: initialTopic });
        }
      }
    }
  }, [isOpen, initialTopic]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = searchHelpArticles(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleArticleClick = (articleId: string) => {
    const article = getHelpArticle(articleId);
    if (article) {
      setCurrentArticle(article);
      setSearchResults([]);
      setSearchQuery("");
      trackHelpAction('view_article', { articleId });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-2xl font-bold">Help Center</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {searchResults.length > 0 ? (
            // Search Results
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-4">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </h3>
              {searchResults.map((result) => (
                <div
                  key={result.article.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleArticleClick(result.article.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{result.article.title}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.article.category}
                      </p>
                      {result.matchedKeywords.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {result.matchedKeywords.map((keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentArticle ? (
            // Article View
            <div className="prose prose-lg max-w-none">
              <div className="mb-4">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentArticle.category}
                </span>
              </div>
              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert text-white' : 'text-gray-900'}`}>
                <ReactMarkdown>
                  {currentArticle.content}
                </ReactMarkdown>
              </div>
              <div className={`mt-8 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {new Date(currentArticle.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            // Welcome View
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Search for help</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Type in the search box above to find help articles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
