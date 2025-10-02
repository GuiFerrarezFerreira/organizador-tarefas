import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Notifications({ notifications }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
            notif.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notif.type === 'error' 
              ? 'bg-red-500 text-white'
              : notif.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {notif.type === 'success' && <CheckCircle size={18} />}
          {notif.type === 'error' && <AlertCircle size={18} />}
          {notif.type === 'warning' && <AlertCircle size={18} />}
          <span className="text-sm font-medium">{notif.message}</span>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
