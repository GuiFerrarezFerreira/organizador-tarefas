import React from 'react';
import { Tag } from 'lucide-react';

export default function TaskEditModal({ 
  task,
  editedTask,
  setEditedTask,
  jobs, 
  tags, 
  selectedEditTags, 
  toggleEditTag, 
  onSave, 
  onCancel, 
  darkMode 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Editar Tarefa
        </h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome da tarefa"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editedTask.jobId}
              onChange={(e) => setEditedTask({ ...editedTask, jobId: parseInt(e.target.value) })}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
            
            <select
              value={editedTask.type}
              onChange={(e) => setEditedTask({ ...editedTask, type: e.target.value })}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="projeto">Projeto</option>
              <option value="atendimento">Atendimento</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={editedTask.date}
              onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
            
            <input
              type="time"
              value={editedTask.time || ''}
              onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value })}
              placeholder="Horário (opcional)"
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
          
          {tags.length > 0 && (
            <div>
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags (opcional):
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleEditTag(tag.id)}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      selectedEditTags.includes(tag.id)
                        ? tag.color + ' ring-2 ring-blue-500'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Tag size={12} className="inline mr-1" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
