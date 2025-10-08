import React, { useState } from 'react';
import { CreditCard, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function FinanceByCardDetailed({ transactions, creditCards, people, getCategoryName, getCategoryColor, darkMode }) {
  const [expandedCards, setExpandedCards] = useState({});

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getPersonName = (personId) => {
    return people.find(p => p.id === personId)?.name || 'Desconhecido';
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Agrupa transações por cartão
  const transactionsByCard = {};
  
  creditCards.forEach(card => {
    transactionsByCard[card.id] = {
      card: card,
      transactions: []
    };
  });

  transactions.forEach(t => {
    if (t.type === 'despesa' && t.creditCardId && transactionsByCard[t.creditCardId]) {
      transactionsByCard[t.creditCardId].transactions.push(t);
    }
  });

  // Ordena transações por data (mais recentes primeiro)
  Object.values(transactionsByCard).forEach(group => {
    group.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        💳 Despesas por Cartão de Crédito
      </h2>

      {creditCards.map(card => {
        const cardData = transactionsByCard[card.id];
        const total = cardData.transactions.reduce((sum, t) => sum + t.amount, 0);
        const isExpanded = expandedCards[card.id];

        return (
          <div
            key={card.id}
            className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
          >
            {/* Header do Cartão */}
            <button
              onClick={() => toggleCard(card.id)}
              className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {card.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {cardData.transactions.length} {cardData.transactions.length === 1 ? 'transação' : 'transações'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold text-red-500`}>
                    {formatCurrency(total)}
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Lista de Transações */}
            {isExpanded && (
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {cardData.transactions.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {cardData.transactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className={`p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.categoryId)}`}>
                                {getCategoryName(transaction.categoryId)}
                              </span>
                              {transaction.isInstallment && transaction.currentInstallment && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  darkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {transaction.currentInstallment}/{transaction.installmentCount}
                                </span>
                              )}
                              {!transaction.completed && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  Pendente
                                </span>
                              )}
                            </div>
                            
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {transaction.description || 'Sem descrição'}
                            </p>
                            
                            <div className={`flex items-center gap-3 mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                              <span>
                                👤 {getPersonName(transaction.ownerId)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-red-500">
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>Nenhuma transação neste cartão</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {creditCards.length === 0 && (
        <div className={`rounded-lg p-12 text-center ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>
          <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum cartão de crédito cadastrado</p>
        </div>
      )}
    </div>
  );
}
