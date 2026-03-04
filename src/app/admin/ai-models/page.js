'use client';

import { useState, useEffect } from 'react';
import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

const PROVIDER_TYPES = [
  { id: 'openrouter', name: 'OpenRouter', color: 'bg-blue-100 text-blue-700', description: 'Free/paid models via OpenRouter API' },
  { id: 'ollama', name: 'Ollama (Local)', color: 'bg-emerald-100 text-emerald-700', description: 'Self-hosted local models' },
  { id: 'openai', name: 'OpenAI', color: 'bg-green-100 text-green-700', description: 'GPT models via OpenAI API' },
  { id: 'anthropic', name: 'Anthropic', color: 'bg-orange-100 text-orange-700', description: 'Claude models via Anthropic API' },
  { id: 'google', name: 'Google AI', color: 'bg-red-100 text-red-700', description: 'Gemini models via Google AI' },
  { id: 'custom', name: 'Custom API', color: 'bg-purple-100 text-purple-700', description: 'Other OpenAI-compatible APIs' },
];

const CAPABILITIES = [
  { id: 'text-to-text', label: 'Text → Text', icon: '📝', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'image-to-text', label: 'Image → Text', icon: '📷', color: 'bg-violet-100 text-violet-700' },
  { id: 'text-to-image', label: 'Text → Image', icon: '🖼️', color: 'bg-pink-100 text-pink-700' },
  { id: 'multi-modal', label: 'Multi-modal', icon: '🔄', color: 'bg-slate-100 text-slate-700' },
];

export default function AIModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterCapability, setFilterCapability] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    modelId: '',
    name: '',
    provider: '',
    providerType: 'openrouter',
    apiKey: '',
    baseUrl: '',
    description: '',
    contextLength: 8192,
    weeklyTokens: '',
    capability: 'text-to-text',
    inputModalities: ['text'],
    outputModalities: ['text'],
    useForKeywordResearch: true,
    useForOutline: true,
    useForContent: true,
    isFree: true,
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/models?source=db');
      const data = await res.json();
      if (res.ok) {
        setModels(data.models || []);
      } else {
        setError(data.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const fetchOllamaModels = async () => {
    try {
      const res = await fetch('/api/ai/models?source=ollama');
      const data = await res.json();
      if (res.ok && data.models.length > 0) {
        // Add Ollama models to the list
        for (const model of data.models) {
          await fetch('/api/ai/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...model,
              providerType: 'ollama',
              isFromAPI: true,
            }),
          });
        }
        fetchModels();
      }
    } catch (err) {
      console.error('Failed to fetch Ollama models:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = editingModel
        ? `/api/ai/models/${editingModel._id}`
        : '/api/ai/models';

      const method = editingModel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setEditingModel(null);
        resetForm();
        fetchModels();
      } else {
        setError(data.error || 'Failed to save model');
      }
    } catch (err) {
      setError('Failed to save model');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const res = await fetch(`/api/ai/models/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchModels();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete model');
      }
    } catch (err) {
      setError('Failed to delete model');
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      modelId: model.modelId,
      name: model.name,
      provider: model.provider,
      providerType: model.providerType || 'openrouter',
      apiKey: model.apiKey || '',
      baseUrl: model.baseUrl || '',
      description: model.description || '',
      contextLength: model.contextLength || 8192,
      weeklyTokens: model.weeklyTokens || '',
      capability: model.capability || 'text-to-text',
      inputModalities: model.inputModalities || ['text'],
      outputModalities: model.outputModalities || ['text'],
      useForKeywordResearch: model.useForKeywordResearch,
      useForOutline: model.useForOutline,
      useForContent: model.useForContent,
      isFree: model.isFree !== false,
      isActive: model.isActive !== false,
      isDefault: model.isDefault,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      modelId: '',
      name: '',
      provider: '',
      providerType: 'openrouter',
      apiKey: '',
      baseUrl: '',
      description: '',
      contextLength: 8192,
      weeklyTokens: '',
      capability: 'text-to-text',
      inputModalities: ['text'],
      outputModalities: ['text'],
      useForKeywordResearch: true,
      useForOutline: true,
      useForContent: true,
      isFree: true,
      isActive: true,
      isDefault: false,
    });
  };

  const openAddModal = () => {
    setEditingModel(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
    resetForm();
    setError('');
  };

  const setAsDefault = async (modelId) => {
    try {
      const model = models.find(m => m._id === modelId || m.modelId === modelId);
      if (!model) return;

      const res = await fetch(`/api/ai/models/${model._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...model, isDefault: true }),
      });

      if (res.ok) {
        fetchModels();
      }
    } catch (err) {
      console.error('Failed to set default:', err);
    }
  };

  const toggleActive = async (model) => {
    try {
      const res = await fetch(`/api/ai/models/${model._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...model, isActive: !model.isActive }),
      });

      if (res.ok) {
        fetchModels();
      }
    } catch (err) {
      console.error('Failed to toggle active:', err);
    }
  };

  const getProviderTypeColor = (type) => {
    const provider = PROVIDER_TYPES.find(p => p.id === type);
    return provider?.color || 'bg-gray-100 text-gray-700';
  };

  const getCapability = (capability) => {
    return CAPABILITIES.find(c => c.id === capability) || CAPABILITIES[0];
  };

  const filteredModels = models.filter(model => {
    const matchesProvider = filterProvider === 'all' || model.providerType === filterProvider;
    const matchesCapability = filterCapability === 'all' || model.capability === filterCapability;
    const matchesSearch = searchQuery === '' || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesCapability && matchesSearch;
  });

  const stats = {
    total: models.length,
    active: models.filter(m => m.isActive).length,
    default: models.filter(m => m.isDefault).length,
    free: models.filter(m => m.isFree).length,
    byProvider: PROVIDER_TYPES.map(p => ({
      ...p,
      count: models.filter(m => m.providerType === p.id).length
    })).filter(p => p.count > 0),
  };

  return (
    <div className={`${spaceGrotesk.variable} font-space-grotesk p-6 max-w-7xl mx-auto`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Models Management</h1>
          <p className="text-slate-600 mt-1">
            Manage AI providers and models for content generation
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back
          </Link>
          <button
            onClick={fetchOllamaModels}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Sync Ollama
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Model
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Total Models</p>
          <p className="text-xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Active</p>
          <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Default</p>
          <p className="text-xl font-bold text-indigo-600">{stats.default}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Free</p>
          <p className="text-xl font-bold text-amber-600">{stats.free}</p>
        </div>
        {stats.byProvider.slice(0, 2).map(p => (
          <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">{p.name}</p>
            <p className="text-xl font-bold text-slate-700">{p.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Providers</option>
            {PROVIDER_TYPES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterCapability}
            onChange={(e) => setFilterCapability(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Capabilities</option>
            {CAPABILITIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No AI Models</h3>
          <p className="text-slate-500 mb-4">Add your first AI model or sync with Ollama</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Model
            </button>
            <button
              onClick={fetchOllamaModels}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Sync Ollama
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Capability</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Context</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900">Use For</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredModels.map((model) => {
                  const capability = getCapability(model.capability);
                  const providerType = PROVIDER_TYPES.find(p => p.id === model.providerType);
                  return (
                    <tr key={model._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-lg">
                            {capability.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-slate-900 text-sm">{model.name}</p>
                              {model.isDefault && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded font-medium">DEFAULT</span>
                              )}
                              {model.isFree && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded">FREE</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{model.modelId}</p>
                            {model.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{model.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${getProviderTypeColor(model.providerType)}`}>
                            {providerType?.name || model.providerType}
                          </span>
                          <span className="text-xs text-slate-500">{model.provider}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${capability.color} flex items-center gap-1 w-fit`}>
                          <span>{capability.icon}</span>
                          <span>{capability.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">{(model.contextLength || 8192).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {model.useForKeywordResearch && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded" title="Keyword Research">KR</span>
                          )}
                          {model.useForOutline && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] rounded" title="Outline">OL</span>
                          )}
                          {model.useForContent && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded" title="Content">CT</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(model)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            model.isActive 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {model.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {!model.isDefault && (
                            <button
                              onClick={() => setAsDefault(model._id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Set as Default"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(model)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(model._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingModel ? 'Edit AI Model' : 'Add New AI Model'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Provider Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Provider Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PROVIDER_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, providerType: type.id })}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        formData.providerType === type.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`text-xs font-medium px-2 py-0.5 rounded w-fit mb-1 ${type.color}`}>
                        {type.name}
                      </div>
                      <p className="text-xs text-slate-500">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model ID *</label>
                  <input
                    type="text"
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    placeholder={formData.providerType === 'ollama' ? 'llama3.2' : 'provider/model-name'}
                    disabled={!!editingModel}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.providerType === 'ollama' && 'e.g., llama3.2, mistral, deepseek-coder'}
                    {formData.providerType === 'openrouter' && 'e.g., meta-llama/llama-3.3-70b-instruct:free'}
                    {formData.providerType === 'openai' && 'e.g., gpt-4, gpt-3.5-turbo'}
                    {formData.providerType === 'anthropic' && 'e.g., claude-3-opus-20240229'}
                    {formData.providerType === 'google' && 'e.g., gemini-pro, gemini-1.5-flash'}
                    {formData.providerType === 'custom' && 'e.g., your-model-name'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Human-readable name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provider Name *</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="e.g., Meta, OpenAI, Local"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Context Length</label>
                  <input
                    type="number"
                    value={formData.contextLength}
                    onChange={(e) => setFormData({ ...formData, contextLength: parseInt(e.target.value) || 8192 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* API Configuration */}
              {(formData.providerType === 'custom' || formData.providerType === 'openai' || formData.providerType === 'anthropic' || formData.providerType === 'google') && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <p className="text-sm font-medium text-slate-700">API Configuration</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">API Key (optional - can use env vars)</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="sk-... or leave empty to use environment variable"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Base URL (optional)</label>
                    <input
                      type="text"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Capability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capability</label>
                <div className="flex flex-wrap gap-2">
                  {CAPABILITIES.map((cap) => (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, capability: cap.id })}
                      className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                        formData.capability === cap.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{cap.icon}</span>
                      <span className="text-sm">{cap.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the model capabilities"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Use For Checkboxes */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Use for:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useForKeywordResearch}
                      onChange={(e) => setFormData({ ...formData, useForKeywordResearch: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Keyword Research</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useForOutline}
                      onChange={(e) => setFormData({ ...formData, useForOutline: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Outline Generation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useForContent}
                      onChange={(e) => setFormData({ ...formData, useForContent: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Content Generation</span>
                  </label>
                </div>
              </div>

              {/* Options */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">Free Model</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">Set as Default</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (editingModel ? 'Update' : 'Add')} Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
