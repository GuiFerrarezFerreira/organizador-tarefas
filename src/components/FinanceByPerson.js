import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, User } from 'lucide-react';

export default function FinanceByPerson({ transactions, people, darkMode }) {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getPersonName = (personId) => {
    return people.find(p => p.id === personId)?.name || 'Desconhecido';
  };

  const getPersonColor = (personId) => {
    return people.find(p => p.id === personId)?.color || 'bg-gray-100 text-gray-700';
  };

  // Calcula totais por pessoa
  const calculateByPerson = () => {
    const byPerson = {};

    people.forEach(person => {
      byPerson[person.id] = {
        income: 0,
        expense: 0,
        balance: 0,
        transactionCount: 0
      };
    });

    transactions.forEach(t => {
      if (t.completed && t.ownerId && byPerson[t.ownerId]) {
        byPerson[t.ownerId].transactionCount++;
        if (t.type === 'receita') {
          byPerson[t.ownerId].income += t.amount;
        } else {
          byPerson[t.ownerId].expense += t.amount;
        }
        byPerson[t.ownerId].balance = byPerson[t.ownerId].income - byPerson[t.ownerId].expense;
      }
    });

    return byPerson;
  };

  const personData = calculateByPerson();

  // Calcula totais gerais
  const totalIncome = Object.values(personData).reduce((sum, p) => sum + p.income, 0);
  const totalExpense = Object.values(personData).reduce((sum, p) => sum + p.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Resumo Geral
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-4 ${
            darkMode 
              ? 'bg-gradient-to-br from-green-900 to-green-800' 
              : 'bg-gradient-to-br from-green-50 to-green-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-green-200' : 'text-green-700'
              }`}>
                Receitas Totais
              </span>
              <TrendingUp size={18} className={darkMode ? 'text-green-300' : 'text-green-600'} />
            </div>
            <div className={`text-xl font-bold ${
              darkMode ? 'text-green-100' : 'text-green-700'
            }`}>
              {formatCurrency(totalIncome)}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            darkMode 
              ? 'bg-gradient-to-br from-red-900 to-red-800' 
              : 'bg-gradient-to-br from-red-50 to-red-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-red-200' : 'text-red-700'
              }`}>
                Despesas Totais
              </span>
              <TrendingDown size={18} className={darkMode ? 'text-red-300' : 'text-red-600'} />
            </div>
            <div className={`text-xl font-bold ${
              darkMode ? 'text-red-100' : 'text-red-700'
            }`}>
              {formatCurrency(totalExpense)}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            totalBalance >= 0
              ? darkMode 
                ? 'bg-gradient-to-br from-blue-900 to-blue-800' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100'
              : darkMode
                ? 'bg-gradient-to-br from-orange-900 to-orange-800'
                : 'bg-gradient-to-br from-orange-50 to-orange-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                totalBalance >= 0
                  ? darkMode ? 'text-blue-200' : 'text-blue-700'
                  : darkMode ? 'text-orange-200' : 'text-orange-700'
              }`}>
                Saldo Total
              </span>
              <DollarSign size={18} className={
                totalBalance >= 0
                  ? darkMode ? 'text-blue-300' : 'text-blue-600'
                  : darkMode ? 'text-orange-300' : 'text-orange-600'
              } />
            </div>
            <div className={`text-xl font-bold ${
              totalBalance >= 0
                ? darkMode ? 'text-blue-100' : 'text-blue-700'
                : darkMode ? 'text-orange-100' : 'text-orange-700'
            }`}>
              {formatCurrency(totalBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes por Pessoa */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Detalhamento por Pessoa
        </h3>
        <div className="space-y-4">
          {people.map(person => {
            const data = personData[person.id];
            const balance = data.balance;

            return (
              <div
                key={person.id}
                className={`rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full ${person.color}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {person.name}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {data.transactionCount} {data.transactionCount === 1 ? 'transação' : 'transações'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Receitas */}
                  <div className={`rounded-lg p-4 ${
                    darkMode 
                      ? 'bg-green-900/30 border border-green-800' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={16} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        Receitas
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-green-200' : 'text-green-700'
                    }`}>
                      {formatCurrency(data.income)}
                    </div>
                  </div>

                  {/* Despesas */}
                  <div className={`rounded-lg p-4 ${
                    darkMode 
                      ? 'bg-red-900/30 border border-red-800' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown size={16} className={darkMode ? 'text-red-400' : 'text-red-600'} />
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        Despesas
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-red-200' : 'text-red-700'
                    }`}>
                      {formatCurrency(data.expense)}
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className={`rounded-lg p-4 ${
                    balance >= 0
                      ? darkMode 
                        ? 'bg-blue-900/30 border border-blue-800' 
                        : 'bg-blue-50 border border-blue-200'
                      : darkMode
                        ? 'bg-orange-900/30 border border-orange-800'
                        : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className={
                        balance >= 0
                          ? darkMode ? 'text-blue-400' : 'text-blue-600'
                          : darkMode ? 'text-orange-400' : 'text-orange-600'
                      } />
                      <span className={`text-xs font-medium ${
                        balance >= 0
                          ? darkMode ? 'text-blue-300' : 'text-blue-700'
                          : darkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        Saldo
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      balance >= 0
                        ? darkMode ? 'text-blue-200' : 'text-blue-700'
                        : darkMode ? 'text-orange-200' : 'text-orange-700'
                    }`}>
                      {formatCurrency(balance)}
                    </div>
                  </div>
                </div>

                {/* Porcentagens */}
                {(data.income > 0 || data.expense > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          % das receitas totais
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {totalIncome > 0 ? ((data.income / totalIncome) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          % das despesas totais
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {totalExpense > 0 ? ((data.expense / totalExpense) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking */}
      <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Rankings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maior receita */}
          <div>
            <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              💰 Maiores Receitas
            </h4>
            <div className="space-y-2">
              {people
                .sort((a, b) => personData[b.id].income - personData[a.id].income)
                .slice(0, 3)
                .map((person, index) => (
                  <div 
                    key={person.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        'text-orange-700'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {person.name}
                      </span>
                    </div>
                    <span className={`font-bold text-green-500`}>
                      {formatCurrency(personData[person.id].income)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Maior despesa */}
          <div>
            <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              💸 Maiores Despesas
            </h4>
            <div className="space-y-2">
              {people
                .sort((a, b) => personData[b.id].expense - personData[a.id].expense)
                .slice(0, 3)
                .map((person, index) => (
                  <div 
                    key={person.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        'text-orange-700'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {person.name}
                      </span>
                    </div>
                    <span className={`font-bold text-red-500`}>
                      {formatCurrency(personData[person.id].expense)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
