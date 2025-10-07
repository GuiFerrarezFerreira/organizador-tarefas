import React from 'react';
import { X, Calendar, Briefcase, CheckCircle, Clock, Edit2 } from 'lucide-react';


export default function FinanceList({ 
  transactions, 
  onToggle, 
  onDelete,
  onEdit,
  getCategoryColor, 
  getCategoryName,
  getJobName,
  getPersonName,
  getCreditCardName,
  darkMode 
}) {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <div
          key={transaction.id}
          className={`rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } ${!transaction.completed && 'opacity-70'}`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggle(transaction.id)}
              className={`mt-1 p-1 rounded transition-colors ${
                transaction.completed
                  ? transaction.type === 'receita'
                    ? 'text-green-500 hover:text-green-600'
                    : 'text-red-500 hover:text-red-600'
                  : darkMode
                  ? 'text-gray-600 hover:text-gray-500'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              {transaction.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-lg font-medium ${
                      transaction.type === 'receita'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {transaction.type === 'receita' ? '💚' : '❤️'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.categoryId)}`}>
                      {getCategoryName(transaction.categoryId)}
                    </span>
                    {transaction.jobId && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Briefcase size={10} className="inline mr-1" />
                        {getJobName(transaction.jobId)}
                      </span>
                    )}
                    {transaction.ownerId && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                      }`}>
                        👤 {getPersonName(transaction.ownerId)}
                      </span>
                    )}
                    {transaction.creditCardId && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                      }`}>
                        💳 {getCreditCardName(transaction.creditCardId)}
                      </span>
                    )}
                    {transaction.isRecurring && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        🔄 Recorrente ({transaction.recurringType === 'monthly' ? 'Mensal' : transaction.recurringType === 'weekly' ? 'Semanal' : 'Anual'})
                      </span>
                    )}
                    {transaction.isInstallment && transaction.currentInstallment && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-700'
                      }`}>
                        📊 {transaction.currentInstallment}/{transaction.installmentCount}
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
                  <p className={`mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {transaction.description || 'Sem descrição'}
                  </p>
                  <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`text-xl font-bold ${
                    transaction.type === 'receita'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(transaction)}
                className={`transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'
                }`}
                title="Editar transação"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className={`transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                }`}
                title="Excluir transação"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className={`rounded-lg p-12 text-center ${
          darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'
        }`}>
          <div className="text-6xl mb-4">💰</div>
          <p>Nenhuma transação para mostrar</p>
        </div>
      )}
    </div>
  );
}
