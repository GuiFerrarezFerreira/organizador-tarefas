import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  showAdvancedFilters,
  setShowAdvancedFilters,
  advancedFilters,
  setAdvancedFilters,
  hasActiveFilters,
  clearAllFilters,
  jobs,
  tags,
  filterByTags,
  toggleFilterTag,
  darkMode,
  showJobFilter = true
}) {
  return (
    <div className="space-y-3">
      {/* Barra de busca */}
      <div className="flex gap-2">
        <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          <Search size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none text-sm ${
              darkMode ? 'text-gray-200 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            showAdvancedFilters || hasActiveFilters()
              ? 'bg-blue-500 text-white'
              : darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtros
        </button>
      </div>

      {/* Filtros avançados */}
      {showAdvancedFilters && (
        <div className={`p-4 rounded-lg space-y-3 ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className={`grid ${showJobFilter ? 'grid-cols-2' : 'grid-cols-2'} gap-3`}>
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
              <select
                value={advancedFilters.status}
                onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
            
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo</label>
              <select
                value={advancedFilters.type}
                onChange={(e) => setAdvancedFilters({...advancedFilters, type: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">Todos</option>
                <option value="projeto">Projeto</option>
                <option value="atendimento">Atendimento</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            
            {showJobFilter && (
              <div>
                <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trabalho</label>
                <select
                  value={advancedFilters.jobId}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, jobId: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">Todos</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className={showJobFilter ? '' : 'col-span-2'}>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Período</label>
              <select
                value={advancedFilters.dateRange}
                onChange={(e) => setAdvancedFilters({...advancedFilters, dateRange: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">Todos</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
          
          {advancedFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data início</label>
                <input
                  type="date"
                  value={advancedFilters.customStartDate}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, customStartDate: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data fim</label>
                <input
                  type="date"
                  value={advancedFilters.customEndDate}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, customEndDate: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtro por tags */}
      {tags.length > 0 && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filtrar por tags:</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleFilterTag(tag.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterByTags.includes(tag.id)
                    ? tag.color + ' ring-2 ring-blue-500'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
            {filterByTags.length > 0 && (
              <button
                onClick={() => toggleFilterTag(null)}
                className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
              >
                Limpar tags
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botão limpar todos filtros */}
      {hasActiveFilters() && (
        <button
          onClick={clearAllFilters}
          className="w-full px-4 py-2 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  );
}
