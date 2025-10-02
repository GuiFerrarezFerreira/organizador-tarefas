import React from 'react';

export default function FinanceForm({ 
  newTransaction, 
  setNewTransaction, 
  categories, 
  jobs,
  onSubmit, 
  onCancel, 
  darkMode 
}) {
  const formatCurrencyInput = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    // Converte para centavos
    const cents = parseInt(numbers) || 0;
    // Formata para BRL
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAmountChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    const cents = Math.round(parseFloat(formatted.replace(',', '.')) * 100);
    setNewTransaction({ ...newTransaction, amount: cents });
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === newTransaction.type || cat.type === 'ambos'
  );

  return (
    <div className={`mt-6 rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Nova Transação
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tipo
            </label>
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({ 
                ...newTransaction, 
                type: e.target.value,
                categoryId: filteredCategories[0]?.id || null
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="receita">💚 Receita</option>
              <option value="despesa">❤️ Despesa</option>
            </select>
          </div>
          
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Categoria
            </label>
            <select
              value={newTransaction.categoryId}
              onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: parseInt(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Valor
          </label>
          <div className="relative">
            <span className={`absolute left-4 top-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              R$
            </span>
            <input
              type="text"
              value={formatCurrencyInput(newTransaction.amount.toString())}
              onChange={handleAmountChange}
              placeholder="0,00"
              className={`w-full pl-12 pr-4 py-3 border rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Descrição
          </label>
          <input
            type="text"
            placeholder="Ex: Pagamento cliente X"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Data
            </label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>

          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Trabalho (opcional)
            </label>
            <select
              value={newTransaction.jobId || ''}
              onChange={(e) => setNewTransaction({ ...newTransaction, jobId: e.target.value ? parseInt(e.target.value) : null })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="">Nenhum</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="completed"
            checked={newTransaction.completed}
            onChange={(e) => setNewTransaction({ ...newTransaction, completed: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="completed" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {newTransaction.type === 'receita' ? 'Receita já recebida' : 'Despesa já paga'}
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Adicionar
          </button>
          <button
            onClick={onCancel}
            className={`px-6 py-3 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
