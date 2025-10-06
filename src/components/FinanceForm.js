import React, { useState } from 'react';

export default function FinanceForm({ 
  newTransaction, 
  setNewTransaction, 
  categories, 
  jobs,
  people,
  creditCards,
  onSubmit, 
  onCancel, 
  darkMode 
}) {
  const formatCurrencyInput = (value) => {
    const numbers = value.replace(/\D/g, '');
    const cents = parseInt(numbers) || 0;
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

  const handleTypeChange = (newType) => {
    const newFilteredCategories = categories.filter(cat => 
      cat.type === newType || cat.type === 'ambos'
    );
    setNewTransaction({ 
      ...newTransaction, 
      type: newType,
      categoryId: newFilteredCategories[0]?.id || null,
      creditCardId: newType === 'receita' ? null : newTransaction.creditCardId,
      paymentMethod: newType === 'receita' ? 'checking' : newTransaction.paymentMethod,
      isRecurring: newType === 'receita' ? false : newTransaction.isRecurring,
      isInstallment: newType === 'receita' ? false : newTransaction.isInstallment
    });
  };

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
              onChange={(e) => handleTypeChange(e.target.value)}
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
            Valor {newTransaction.isInstallment && `(por parcela)`}
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
          {newTransaction.isInstallment && newTransaction.installmentCount > 0 && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total: {formatCurrencyInput((newTransaction.amount * newTransaction.installmentCount).toString())}
            </p>
          )}
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
              Data {newTransaction.isInstallment ? '(primeira parcela)' : newTransaction.isRecurring ? '(primeira ocorrência)' : ''}
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

        {/* Responsável */}
        <div>
          <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {newTransaction.type === 'receita' ? 'Quem recebeu' : 'Quem gastou'}
          </label>
          <select
            value={newTransaction.ownerId}
            onChange={(e) => setNewTransaction({ ...newTransaction, ownerId: parseInt(e.target.value) })}
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

        {/* Forma de pagamento (apenas para despesas) */}
        {newTransaction.type === 'despesa' && (
          <>
            <div>
              <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Forma de pagamento
              </label>
              <select
                value={newTransaction.paymentMethod}
                onChange={(e) => setNewTransaction({ 
                  ...newTransaction, 
                  paymentMethod: e.target.value,
                  creditCardId: e.target.value === 'checking' ? null : newTransaction.creditCardId
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

            {/* Seleção de cartão */}
            {newTransaction.paymentMethod === 'credit' && (
              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cartão de crédito
                </label>
                {creditCards.length > 0 ? (
                  <select
                    value={newTransaction.creditCardId || ''}
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
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
                    Nenhum cartão cadastrado. Cadastre um cartão primeiro.
                  </div>
                )}
              </div>
            )}

            {/* NOVO: Opções de recorrência e parcelamento */}
            <div className={`p-4 rounded-lg space-y-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTransaction.isRecurring}
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
                      isRecurring: e.target.checked,
                      isInstallment: e.target.checked ? false : newTransaction.isInstallment
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    🔄 Despesa Fixa/Recorrente
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTransaction.isInstallment}
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
                      isInstallment: e.target.checked,
                      isRecurring: e.target.checked ? false : newTransaction.isRecurring
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    📊 Parcelado
                  </span>
                </label>
              </div>

              {/* Opções de recorrência */}
              {newTransaction.isRecurring && (
                <div>
                  <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Frequência
                  </label>
                  <select
                    value={newTransaction.recurringType}
                    onChange={(e) => setNewTransaction({ ...newTransaction, recurringType: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ⚠️ Será criada automaticamente todos os meses na data especificada
                  </p>
                </div>
              )}

              {/* Opções de parcelamento */}
              {newTransaction.isInstallment && (
                <div>
                  <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de parcelas
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="48"
                    value={newTransaction.installmentCount}
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
                      installmentCount: parseInt(e.target.value) || 2
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ⚠️ Serão criadas {newTransaction.installmentCount}x de {formatCurrencyInput(newTransaction.amount.toString())}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

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
