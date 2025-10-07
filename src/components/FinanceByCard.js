import React from 'react';
import { TrendingDown, DollarSign, CreditCard, Calendar } from 'lucide-react';

export default function FinanceByCard({ transactions, creditCards, people, darkMode }) {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getCreditCardName = (cardId) => {
    return creditCards.find(c => c.id === cardId)?.name || 'Desconhecido';
  };

  const getPersonName = (personId) => {
    return people.find(p => p.id === personId)?.name || 'Desconhecido';
  };

  const getCreditCardOwner = (cardId) => {
    const card = creditCards.find(c => c.id === cardId);
    return card ? getPersonName(card.owner) : 'Desconhecido';
  };

  const getCreditCardInfo = (cardId) => {
    return creditCards.find(c => c.id === cardId) || null;
  };

  // Calcula totais por cartão
  const calculateByCard = () => {
    const byCard = {};

    // Inicializa com todos os cartões
    creditCards.forEach(card => {
      byCard[card.id] = {
        total: 0,
        paid: 0,
        pending: 0,
        transactionCount: 0,
        transactions: []
      };
    });

    // Processa apenas despesas com cartão de crédito
    transactions.forEach(t => {
      if (t.type === 'despesa' && t.creditCardId && byCard[t.creditCardId]) {
        byCard[t.creditCardId].transactionCount++;
        byCard[t.creditCardId].transactions.push(t);
        
        if (t.completed) {
          byCard[t.creditCardId].paid += t.amount;
        } else {
          byCard[t.creditCardId].pending += t.amount;
        }
        byCard[t.creditCardId].total += t.amount;
      }
    });

    return byCard;
  };

  const cardData = calculateByCard();

  // Calcula totais gerais
  const totalExpense = Object.values(cardData).reduce((sum, c) => sum + c.total, 0);
  const totalPaid = Object.values(cardData).reduce((sum, c) => sum + c.paid, 0);
  const totalPending = Object.values(cardData).reduce((sum, c) => sum + c.pending, 0);

  // Calcula a fatura do mês atual para cada cartão
  const getCurrentMonthInvoice = (cardId) => {
    const card = getCreditCardInfo(cardId);
    if (!card) return 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Data de fechamento da fatura atual
    const closingDate = new Date(currentYear, currentMonth, card.closingDay);
    
    // Se já passou do dia de fechamento, considera o próximo mês
    if (today.getDate() > card.closingDay) {
      closingDate.setMonth(closingDate.getMonth() + 1);
    }

    // Data de fechamento da fatura anterior
    const previousClosingDate = new Date(closingDate);
    previousClosingDate.setMonth(previousClosingDate.getMonth() - 1);

    // Filtra transações do período da fatura
    return cardData[cardId].transactions
      .filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00');
        return transactionDate > previousClosingDate && transactionDate <= closingDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Resumo Geral - Cartões de Crédito
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-4 ${
            darkMode 
              ? 'bg-gradient-to-br from-red-900 to-red-800' 
              : 'bg-gradient-to-br from-red-50 to-red-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-red-200' : 'text-red-700'
              }`}>
                Total Gasto
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
            darkMode 
              ? 'bg-gradient-to-br from-green-900 to-green-800' 
              : 'bg-gradient-to-br from-green-50 to-green-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-green-200' : 'text-green-700'
              }`}>
                Já Pago
              </span>
              <DollarSign size={18} className={darkMode ? 'text-green-300' : 'text-green-600'} />
            </div>
            <div className={`text-xl font-bold ${
              darkMode ? 'text-green-100' : 'text-green-700'
            }`}>
              {formatCurrency(totalPaid)}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            darkMode 
              ? 'bg-gradient-to-br from-yellow-900 to-yellow-800' 
              : 'bg-gradient-to-br from-yellow-50 to-yellow-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-yellow-200' : 'text-yellow-700'
              }`}>
                A Pagar
              </span>
              <Calendar size={18} className={darkMode ? 'text-yellow-300' : 'text-yellow-600'} />
            </div>
            <div className={`text-xl font-bold ${
              darkMode ? 'text-yellow-100' : 'text-yellow-700'
            }`}>
              {formatCurrency(totalPending)}
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes por Cartão */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Detalhamento por Cartão
        </h3>
        <div className="space-y-4">
          {creditCards.map(card => {
            const data = cardData[card.id];
            const currentInvoice = getCurrentMonthInvoice(card.id);

            return (
              <div
                key={card.id}
                className={`rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${card.color}`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {card.name}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {getCreditCardOwner(card.id)} • Fecha dia {card.closingDay} • Vence dia {card.dueDay}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-medium ${
                    darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {data.transactionCount} {data.transactionCount === 1 ? 'compra' : 'compras'}
                  </div>
                </div>

                {/* Fatura do Mês */}
                <div className={`mb-4 p-4 rounded-lg ${
                  darkMode ? 'bg-blue-900/30 border-2 border-blue-700' : 'bg-blue-50 border-2 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        💳 Fatura do Mês Atual
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Vencimento: {card.dueDay}/{new Date().getMonth() + 2}/{new Date().getFullYear()}
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      {formatCurrency(currentInvoice)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Total */}
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
                        Total Gasto
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-red-200' : 'text-red-700'
                    }`}>
                      {formatCurrency(data.total)}
                    </div>
                  </div>

                  {/* Pago */}
                  <div className={`rounded-lg p-4 ${
                    darkMode 
                      ? 'bg-green-900/30 border border-green-800' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        Já Pago
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-green-200' : 'text-green-700'
                    }`}>
                      {formatCurrency(data.paid)}
                    </div>
                  </div>

                  {/* Pendente */}
                  <div className={`rounded-lg p-4 ${
                    darkMode 
                      ? 'bg-yellow-900/30 border border-yellow-800' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-yellow-300' : 'text-yellow-700'
                      }`}>
                        A Pagar
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                      {formatCurrency(data.pending)}
                    </div>
                  </div>
                </div>

                {/* Porcentagens */}
                {data.total > 0 && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          % do total gasto
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {totalExpense > 0 ? ((data.total / totalExpense) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          % pago
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {data.total > 0 ? ((data.paid / data.total) * 100).toFixed(1) : 0}%
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
          {/* Mais usado */}
          <div>
            <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              💳 Cartões Mais Usados
            </h4>
            <div className="space-y-2">
              {creditCards
                .sort((a, b) => cardData[b.id].transactionCount - cardData[a.id].transactionCount)
                .slice(0, 3)
                .map((card, index) => (
                  <div 
                    key={card.id}
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
                        {card.name}
                      </span>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cardData[card.id].transactionCount} compras
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Maior gasto */}
          <div>
            <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              💸 Maiores Gastos
            </h4>
            <div className="space-y-2">
              {creditCards
                .sort((a, b) => cardData[b.id].total - cardData[a.id].total)
                .slice(0, 3)
                .map((card, index) => (
                  <div 
                    key={card.id}
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
                        {card.name}
                      </span>
                    </div>
                    <span className={`font-bold text-red-500`}>
                      {formatCurrency(cardData[card.id].total)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {creditCards.length === 0 && (
        <div className={`rounded-lg p-12 text-center ${
          darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'
        }`}>
          <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum cartão de crédito cadastrado</p>
          <p className="text-sm mt-2">Cadastre cartões para ver o relatório</p>
        </div>
      )}
    </div>
  );
}
