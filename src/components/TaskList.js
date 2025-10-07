import React from 'react';
import { X, Calendar, Briefcase, Tag, Edit2 } from 'lucide-react';

export default function TaskList({ 
  tasks, 
  onToggle, 
  onDelete,
  onEdit, // Certifique-se de que essa prop existe
  getJobColor, 
  getJobName, 
  getTagColor, 
  getTagName, 
  darkMode,
  hasActiveFilters
}) {
  return (
    <div className="space-y-3">
      {hasActiveFilters && (
        <div className={`px-4 py-2 rounded-lg text-sm ${
          darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {tasks.length} {tasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
        </div>
      )}
      
      {tasks.map(task => (
        <div
          key={task.id}
          className={`rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getJobColor(task.jobId)}`}>
                  {getJobName(task.jobId)}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {task.type}
                </span>
                {task.tags && task.tags.length > 0 && (
                  <>
                    {task.tags.map(tagId => (
                      <span key={tagId} className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(tagId)}`}>
                        <Tag size={10} className="inline mr-1" />
                        {getTagName(tagId)}
                      </span>
                    ))}
                  </>
                )}
              </div>
              
              {/* TÍTULO */}
              <p className={`mb-1 font-medium ${task.completed 
                ? `line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}` 
                : `${darkMode ? 'text-gray-200' : 'text-gray-800'}`
              }`}>
                {task.title}
              </p>
              
              {/* DESCRIÇÃO - NOVO */}
              {task.description && (
                <p className={`mb-2 text-sm ${task.completed 
                  ? `line-through ${darkMode ? 'text-gray-600' : 'text-gray-500'}` 
                  : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`
                }`}>
                  {task.description}
                </p>
              )}
              
              <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(task.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
                {task.time && <span>{task.time}</span>}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className={`transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'
                }`}
                title="Editar tarefa"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className={`transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                }`}
                title="Excluir tarefa"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className={`rounded-lg p-12 text-center ${
          darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'
        }`}>
          <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma tarefa para mostrar</p>
        </div>
      )}
    </div>
  );
}
