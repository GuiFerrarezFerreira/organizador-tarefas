import React from 'react';

export default function TransactionEditModal({ 
  transaction,
  editedTransaction, 
  setEditedTransaction, 
  categories, 
  jobs,
  people,
  creditCards,
  onSave, 
  onCancel, 
  darkMode 
}) {
  const formatCurrencyInput = (value) => {
    const numbers = value.replace(/\D/g, '');
    const cents = Number(numbers) || 0;
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAmountChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    const cleanValue = formatted.replace(/\./g, '').replace(',', '.');
    const cents = Math.round(parseFloat(cleanValue) * 100);
    setEditedTransaction({ ...editedTransaction, amount: cents });
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === editedTransaction.type || cat.type === 'ambos'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`rounded-lg p-6 max-w-md w-full my-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Editar Transação
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo
              </label>
              <select
                value={editedTransaction.type}
                onChange={(e) => setEditedTransaction({ 
                  ...editedTransaction, 
                  type: e.target.value,
                  categoryId: categories.find(c => c.type === e.target.value || c.type === 'ambos')?.id || editedTransaction.categoryId
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
                value={editedTransaction.categoryId}
                onChange={(e) => setEditedTransaction({ ...editedTransaction, categoryId: parseInt(e.target.value) })}
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
                value={formatCurrencyInput(editedTransaction.amount.toString())}
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
              value={editedTransaction.description}
              onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
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
                value={editedTransaction.date}
                onChange={(e) => setEditedTransaction({ ...editedTransaction, date: e.target.value })}
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
                value={editedTransaction.jobId || ''}
                onChange={(e) => setEditedTransaction({ ...editedTransaction, jobId: e.target.value ? parseInt(e.target.value) : null })}
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

          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {editedTransaction.type === 'receita' ? 'Quem recebeu' : 'Quem gastou'}
            </label>
            <select
              value={editedTransaction.ownerId}
              onChange={(e) => setEditedTransaction({ ...editedTransaction, ownerId: parseInt(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {people.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>

          {editedTransaction.type === 'despesa' && (
            <>
              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Forma de pagamento
                </label>
                <select
                  value={editedTransaction.paymentMethod}
                  onChange={(e) => setEditedTransaction({ 
                    ...editedTransaction, 
                    paymentMethod: e.target.value,
                    creditCardId: e.target.value === 'checking' ? null : editedTransaction.creditCardId
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="checking">💰 Débito/Dinheiro</option>
                  <option value="credit">💳 Cartão de Crédito</option>
                </select>
              </div>

              {editedTransaction.paymentMethod === 'credit' && (
                <div>
                  <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cartão de crédito
                  </label>
                  {creditCards.length > 0 ? (
                    <select
                      value={editedTransaction.creditCardId || ''}
                      onChange={(e) => setEditedTransaction({ 
                        ...editedTransaction, 
                        creditCardId: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="">Selecione um cartão</option>
                      {creditCards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name} (Fecha dia {card.closingDay})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={`w-full px-4 py-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-500'
                    }`}>
                      Nenhum cartão cadastrado
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editCompleted"
              checked={editedTransaction.completed}
              onChange={(e) => setEditedTransaction({ ...editedTransaction, completed: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="editCompleted" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {editedTransaction.type === 'receita' ? 'Receita já recebida' : 'Despesa já paga'}
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Salvar
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
    </div>
  );
}
