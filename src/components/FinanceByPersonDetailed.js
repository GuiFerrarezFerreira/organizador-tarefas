import React, { useState } from 'react';
import { User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function FinanceByPersonDetailed({ transactions, people, getCategoryName, getCategoryColor, getJobName, getCreditCardName, darkMode }) {
  const [expandedPeople, setExpandedPeople] = useState({});

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const togglePerson = (personId) => {
    setExpandedPeople(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

  // Agrupa transações por pessoa
  const transactionsByPerson = {};
  
  people.forEach(person => {
    transactionsByPerson[person.id] = {
      person: person,
      transactions: []
    };
  });

  transactions.forEach(t => {
    if (t.completed && t.ownerId && transactionsByPerson[t.ownerId]) {
      transactionsByPerson[t.ownerId].transactions.push(t);
    }
  });

  // Ordena transações por data (mais recentes primeiro)
  Object.values(transactionsByPerson).forEach(group => {
    group.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        👥 Transações por Pessoa
      </h2>

      {people.map(person => {
        const personData = transactionsByPerson[person.id];
        const income = personData.transactions
          .filter(t => t.type === 'receita')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = personData.transactions
          .filter(t => t.type === 'despesa')
          .reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;
        const isExpanded = expandedPeople[person.id];

        return (
          <div
            key={person.id}
            className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
          >
            {/* Header da Pessoa */}
            <button
              onClick={() => togglePerson(person.id)}
              className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${person.color}`}>
                  <User size={20} />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {person.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {personData.transactions.length} {personData.transactions.length === 1 ? 'transação' : 'transações'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex gap-3 text-sm mb-1">
                    <span className="text-green-500 font-medium">
                      ↑ {formatCurrency(income)}
                    </span>
                    <span className="text-red-500 font-medium">
                      ↓ {formatCurrency(expense)}
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${
                    balance >= 0 ? 'text-blue-500' : 'text-orange-500'
                  }`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Lista de Transações */}
            {isExpanded && (
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {personData.transactions.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {personData.transactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className={`p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-base ${
                                transaction.type === 'receita' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.type === 'receita' ? '💚' : '❤️'}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.categoryId)}`}>
                                {getCategoryName(transaction.categoryId)}
                              </span>
                              {transaction.creditCardId && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  💳 {getCreditCardName(transaction.creditCardId)}
                                </span>
                              )}
                              {transaction.isInstallment && transaction.currentInstallment && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  darkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {transaction.currentInstallment}/{transaction.installmentCount}
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
                              {transaction.jobId && (
                                <span>
                                  💼 {getJobName(transaction.jobId)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <p className={`text-lg font-bold ${
                              transaction.type === 'receita' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>Nenhuma transação para esta pessoa</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
