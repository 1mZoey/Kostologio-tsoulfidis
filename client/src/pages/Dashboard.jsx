import { useState, useEffect, useRef } from 'react';
import { Search, Package, Box, Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCostItems } from '../services/api';

function Dashboard() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([getProducts(), getCostItems()])
      .then(([productsRes, materialsRes]) => {
        setProducts(productsRes.data);
        setMaterials(materialsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  const normalize = (str) => 
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const normalizedQuery = normalize(query);

  const filteredProducts = products.filter(p => 
    normalize(p.name).includes(normalizedQuery) ||
    normalize(p.category).includes(normalizedQuery)
  );

  const filteredMaterials = materials.filter(m => 
    normalize(m.name).includes(normalizedQuery) || 
    normalize(m.source).includes(normalizedQuery) ||
    normalize(m.category).includes(normalizedQuery)
  );

  const combinedResults = [
    ...filteredProducts.map(p => ({ ...p, type: 'product' })),
    ...filteredMaterials.map(m => ({ ...m, type: 'material' }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!query) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < combinedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Tab') {
      if (combinedResults[selectedIndex]) {
        e.preventDefault();
        const selectedItem = combinedResults[selectedIndex];
        setQuery(selectedItem.name || selectedItem.source);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedResults[selectedIndex]) {
        handleSelect(combinedResults[selectedIndex]);
      }
    }
  };

  const handleSelect = (item) => {
    navigate('/calculator', { state: { selectedItem: item } });
  };

  const currentSuggestion = query && combinedResults[selectedIndex] 
    ? (combinedResults[selectedIndex].name || combinedResults[selectedIndex].source)
    : '';

  const showGhostText = currentSuggestion && normalize(currentSuggestion).startsWith(normalizedQuery);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl flex flex-col items-center space-y-4 -mt-32 relative">
        <div className="flex items-center space-x-3 mb-2 text-gray-500 dark:text-gray-400">
          <Calculator className="w-6 h-6" />
          <span className="text-sm font-semibold tracking-wider uppercase">Αναζήτηση & Υπολογισμός</span>
        </div>

        <div className="w-full relative group z-10">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-gray-200 transition-colors duration-200" />
          </div>
          
          {showGhostText && (
            <div className="absolute inset-0 flex items-center pointer-events-none pl-16 pr-6 py-5 text-xl font-medium">
              <span className="invisible whitespace-pre">{query}</span>
              <span className="text-gray-300 dark:text-gray-600 truncate">
                {currentSuggestion.slice(query.length)}
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-16 pr-6 py-5 text-xl bg-white/80 dark:bg-[#282c34]/80 border-2 border-gray-100 dark:border-[#181a1f] rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 transition-all shadow-lg font-medium"
            placeholder={showGhostText ? "" : "Αναζητήστε προϊόντα ή υλικά..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {query.length > 0 && !loading && (
          <div className="w-full absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#282c34] border border-gray-100 dark:border-[#181a1f] rounded-2xl shadow-xl overflow-hidden max-h-[50vh] overflow-y-auto z-20">
            {combinedResults.length > 0 ? (
              <div className="py-2">
                {combinedResults.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div 
                      key={`${item.type}-${item._id || index}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-gray-50 dark:bg-[#2c313c]' 
                          : 'hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-white dark:bg-[#282c34] shadow-sm' : 'bg-transparent text-gray-400'
                        }`}>
                          {item.type === 'product' ? (
                            <Package className={`w-5 h-5 ${isSelected ? 'text-gray-800 dark:text-gray-200' : ''}`} />
                          ) : (
                            <Box className={`w-5 h-5 ${isSelected ? 'text-gray-800 dark:text-gray-200' : ''}`} />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-medium ${isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {item.name || item.source}
                          </h3>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {item.type === 'product' ? 'Προϊόν' : 'Υλικό'} {item.category ? `• ${item.category}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">
                          {item.type === 'product' && item.defaultThicknessMm ? `${item.defaultThicknessMm}mm` : ''}
                          {item.type === 'material' ? `€${item.price || item.costPerUnit || '0.00'}` : ''}
                        </span>
                        {isSelected && <ArrowRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">Δεν βρέθηκαν αποτελέσματα</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard;