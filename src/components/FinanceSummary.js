import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FinanceSummary({ transactions, darkMode }) {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const calculateTotals = () => {
    return transactions.reduce((acc, t) => {
      if (t.completed) {
        if (t.type === 'receita') {
          acc.income += t.amount;
        } else {
          acc.expense += t.amount;
        }
      }
      return acc;
    }, { income: 0, expense: 0 });
  };

  const { income, expense } = calculateTotals();
  const balance = income - expense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Receitas */}
      <div className={`rounded-lg p-6 ${
        darkMode 
          ? 'bg-gradient-to-br from-green-900 to-green-800' 
          : 'bg-gradient-to-br from-green-50 to-green-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            darkMode ? 'text-green-200' : 'text-green-700'
          }`}>
            Receitas
          </span>
          <TrendingUp size={20} className={darkMode ? 'text-green-300' : 'text-green-600'} />
        </div>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-green-100' : 'text-green-700'
        }`}>
          {formatCurrency(income)}
        </div>
      </div>

      {/* Despesas */}
      <div className={`rounded-lg p-6 ${
        darkMode 
          ? 'bg-gradient-to-br from-red-900 to-red-800' 
          : 'bg-gradient-to-br from-red-50 to-red-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            darkMode ? 'text-red-200' : 'text-red-700'
          }`}>
            Despesas
          </span>
          <TrendingDown size={20} className={darkMode ? 'text-red-300' : 'text-red-600'} />
        </div>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-red-100' : 'text-red-700'
        }`}>
          {formatCurrency(expense)}
        </div>
      </div>

      {/* Saldo */}
      <div className={`rounded-lg p-6 ${
        balance >= 0
          ? darkMode 
            ? 'bg-gradient-to-br from-blue-900 to-blue-800' 
            : 'bg-gradient-to-br from-blue-50 to-blue-100'
          : darkMode
            ? 'bg-gradient-to-br from-orange-900 to-orange-800'
            : 'bg-gradient-to-br from-orange-50 to-orange-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            balance >= 0
              ? darkMode ? 'text-blue-200' : 'text-blue-700'
              : darkMode ? 'text-orange-200' : 'text-orange-700'
          }`}>
            Saldo
          </span>
          <DollarSign size={20} className={
            balance >= 0
              ? darkMode ? 'text-blue-300' : 'text-blue-600'
              : darkMode ? 'text-orange-300' : 'text-orange-600'
          } />
        </div>
        <div className={`text-2xl font-bold ${
          balance >= 0
            ? darkMode ? 'text-blue-100' : 'text-blue-700'
            : darkMode ? 'text-orange-100' : 'text-orange-700'
        }`}>
          {formatCurrency(balance)}
        </div>
      </div>
    </div>
  );
}
