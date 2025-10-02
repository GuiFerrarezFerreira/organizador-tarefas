import React from 'react';
import { Tag } from 'lucide-react';

export default function TaskForm({ 
  newTask, 
  setNewTask, 
  jobs, 
  tags, 
  selectedTags, 
  toggleTagInTask, 
  onSubmit, 
  onCancel, 
  darkMode 
}) {
  return (
    <div className={`mt-6 rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Nova Tarefa</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome da tarefa"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={newTask.jobId}
            onChange={(e) => setNewTask({ ...newTask, jobId: parseInt(e.target.value) })}
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
            value={newTask.type}
            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
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
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
          <input
            type="time"
            value={newTask.time}
            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
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
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags (opcional):</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagInTask(tag.id)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                    selectedTags.includes(tag.id)
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
