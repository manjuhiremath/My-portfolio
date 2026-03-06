'use client';

import { useState, useEffect, useRef } from 'react';
import { Archivo, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

function SearchableDropdown({ label, value, onChange, options, placeholder, disabled, onCreateNew, createLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = searchTerm && !filteredOptions.some(opt =>
    opt.name.toLowerCase() === searchTerm.toLowerCase()
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    onCreateNew(searchTerm);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedOption = options.find(opt => opt.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk bg-white cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-slate-900 text-sm' : 'text-slate-400 text-sm'}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="py-1">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No options found
              </div>
            ) : (
              <>
                {filteredOptions.map((option, index) => (
                  <button
                    key={option._id || option.slug || option.name || index}
                    type="button"
                    onClick={() => handleSelect(option.name)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors ${
                      value === option.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
                {showCreateOption && onCreateNew && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full px-4 py-3 text-left text-sm text-indigo-600 hover:bg-indigo-50 border-t border-slate-100 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {createLabel || `Create "${searchTerm}"`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-archivo',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

const SITE_URL = 'https://www.manjuhiremath.in';

const STEPS = [
  {
    id: 1,
    name: 'Keyword',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    )
  },
  {
    id: 2,
    name: 'Outline',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 3,
    name: 'Generate',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    id: 4,
    name: 'SEO',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zm0 0v1a3 3 0 100 6 3 3 0 000-6v-1" />
      </svg>
    )
  },
  {
    id: 5,
    name: 'Publish',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9zm0 0v-8" />
      </svg>
    )
  },
];

const TONE_OPTIONS = ['Professional', 'Friendly', 'Technical', 'Marketing', 'Beginner'];
const LENGTH_OPTIONS = [
  { value: 1500, label: '1500 words (Standard)' },
  { value: 2000, label: '2000 words (Comprehensive)' },
  { value: 2500, label: '2500 words (In-depth)' },
];

function getModelText(model) {
  return `${model?.modelId || ''} ${model?.name || ''} ${model?.description || ''}`.toLowerCase();
}

function getModelCapabilityLabel(model) {
  const input = model.inputModalities || [];
  const output = model.outputModalities || [];
  const hasText = input.includes('text') || input.length === 0;
  const hasImageInput = input.includes('image');
  const hasTextOutput = output.includes('text') || model.hasTextOutput || output.length === 0;
  const hasImageOutput = output.includes('image');

  if (hasImageOutput) return 'Text → Image';
  if (hasImageInput && hasTextOutput) return 'Image → Text';
  if (hasText && hasTextOutput) return 'Text → Text';
  return 'Multi-modal';
}

function isLikelyImageGenerationModel(model) {
  const text = getModelText(model);
  const imageGenHints = [
    'text-to-image',
    'image generation',
    'image-generation',
    'stable-diffusion',
    'sdxl',
    'flux',
    'dall-e',
    'midjourney',
    'imagen',
  ];
  if (imageGenHints.some((hint) => text.includes(hint))) return true;

  const features = model?.endpoint?.features || {};
  if (features.image_generation === true || features.text_to_image === true) return true;

  const inputModalities = Array.isArray(model?.inputModalities) ? model.inputModalities : [];
  const outputModalities = Array.isArray(model?.outputModalities) ? model.outputModalities : [];
  const modalityText = `${inputModalities.join(' ')} ${outputModalities.join(' ')}`.toLowerCase();
  if (modalityText.includes('text->image') || modalityText.includes('text-to-image') || outputModalities.includes('image')) {
    return true;
  }

  return false;
}

function isFreeModel(model) {
  return model?.isFree !== false;
}

export default function AIBlogGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [processingImageWithAI, setProcessingImageWithAI] = useState(false);

  const [keywordResearch, setKeywordResearch] = useState({
    url: '',
    competitorUrls: '',
    mainTopic: '',
    industry: '',
    isResearching: false,
    results: null,
  });

  const [keywordData, setKeywordData] = useState({
    primaryKeyword: '',
    secondaryKeywords: '',
    blogTitle: '',
    targetAudience: '',
    contentLength: 1500,
    tone: 'Professional',
    category: '',
    subcategory: '',
    selectedModel: '',
  });

  const [useOnlineMode, setUseOnlineMode] = useState(false);
  const [aiModels, setAiModels] = useState([]);
  const [aiModelsLoading, setAiModelsLoading] = useState(true);
  const [imageModel, setImageModel] = useState('');

  const [outline, setOutline] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    slug: '',
    focusKeyword: '',
    canonicalUrl: '',
    featuredImage: '',
  });
  const [publishData, setPublishData] = useState({
    category: '',
    subcategory: '',
    tags: '',
    featuredImage: '',
    publishDate: '',
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);

  const [createModal, setCreateModal] = useState({
    isOpen: false,
    type: '',
    name: '',
    loading: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchAIModels();
  }, []);

  const freeModels = aiModels.filter(isFreeModel);
  const textModels = freeModels.filter((model) => !isLikelyImageGenerationModel(model));
  const imageModels = freeModels.filter((model) => isLikelyImageGenerationModel(model));

  const fetchAIModels = async () => {
    try {
      setAiModelsLoading(true);
      const res = await fetch('/api/ai/models');
      const data = await res.json();
      if (res.ok && data.models) {
        setAiModels(data.models);
        const free = data.models.filter(isFreeModel);
        const text = free.filter((m) => !isLikelyImageGenerationModel(m));
        const image = free.filter((m) => isLikelyImageGenerationModel(m));
        // Set default text model
        const defaultModel = text.find(m => m.isDefault) || text[0] || free[0];
        if (defaultModel) {
          setKeywordData(prev => ({ ...prev, selectedModel: defaultModel._id }));
        }
        // Set default image model
        const defaultImageModel = image.find(m => m.isDefault) || image[0];
        if (defaultImageModel) {
          setImageModel(defaultImageModel._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI models:', err);
    } finally {
      setAiModelsLoading(false);
    }
  };

  useEffect(() => {
    if (seoData.slug && keywordData.category && keywordData.subcategory) {
      const categorySlug = generateSlug(keywordData.category);
      const subcategorySlug = generateSlug(keywordData.subcategory);
      const blogSlug = seoData.slug;
      const canonicalUrl = `${SITE_URL}/blog/${categorySlug}/${subcategorySlug}/${blogSlug}`;
      setSeoData(prev => ({ ...prev, canonicalUrl }));
    } else if (seoData.slug) {
      const blogSlug = seoData.slug;
      const canonicalUrl = `${SITE_URL}/blog/${blogSlug}`;
      setSeoData(prev => ({ ...prev, canonicalUrl }));
    }
  }, [seoData.slug, keywordData.category, keywordData.subcategory]);

  const topLevelCategories = Array.isArray(categories) ? categories.filter(cat => !cat.parent) : [];
  const getSubcategories = (parentId) => Array.isArray(categories) ? categories.filter(cat => cat.parent === parentId) : [];

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const calculateSeoScore = () => {
    let score = 0;
    const checks = [];

    if (seoData.metaTitle && seoData.metaTitle.length >= 30 && seoData.metaTitle.length <= 60) {
      score += 20;
      checks.push({ name: 'Meta Title', status: 'good' });
    } else {
      checks.push({ name: 'Meta Title', status: seoData.metaTitle ? 'warning' : 'poor' });
    }

    if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
      score += 20;
      checks.push({ name: 'Meta Description', status: 'good' });
    } else {
      checks.push({ name: 'Meta Description', status: seoData.metaDescription ? 'warning' : 'poor' });
    }

    if (seoData.slug && seoData.focusKeyword) {
      if (seoData.slug.includes(seoData.focusKeyword.toLowerCase())) {
        score += 20;
        checks.push({ name: 'Slug Optimization', status: 'good' });
      } else {
        score += 10;
        checks.push({ name: 'Slug Optimization', status: 'warning' });
      }
    } else {
      checks.push({ name: 'Slug Optimization', status: 'poor' });
    }

    if (generatedContent.includes(seoData.focusKeyword)) {
      const density = (generatedContent.split(seoData.focusKeyword).length - 1) / (generatedContent.split(' ').length) * 100;
      if (density >= 1 && density <= 3) {
        score += 20;
        checks.push({ name: 'Keyword Density', status: 'good' });
      } else {
        score += 10;
        checks.push({ name: 'Keyword Density', status: 'warning' });
      }
    } else {
      checks.push({ name: 'Keyword Density', status: 'poor' });
    }

    if (generatedContent.length >= 800) {
      score += 20;
      checks.push({ name: 'Content Length', status: 'good' });
    } else {
      score += 10;
      checks.push({ name: 'Content Length', status: 'warning' });
    }

    return { score, checks };
  };

  const seoScore = calculateSeoScore();

  const wordCount = generatedContent ? generatedContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreateCategory = async (name, parentId = null) => {
    setCreateModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          parent: parentId,
        }),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const newCategory = await res.json();
      await fetchCategories();

      if (parentId) {
        setKeywordData(prev => ({ ...prev, subcategory: newCategory.name }));
        setPublishData(prev => ({ ...prev, subcategory: newCategory.name }));
      } else {
        setKeywordData(prev => ({ ...prev, category: newCategory.name, subcategory: '' }));
        setPublishData(prev => ({ ...prev, category: newCategory.name, subcategory: '' }));
      }

      setCreateModal({ isOpen: false, type: '', name: '', loading: false });
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err.message);
      setCreateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openCreateModal = (type, name) => {
    setCreateModal({ isOpen: true, type, name, loading: false });
  };

  const renderCreateModal = () => {
    if (!createModal.isOpen) return null;

    const isSubcategory = createModal.type === 'subcategory';
    const parentCategory = categories.find(c => c.name === keywordData.category);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Create New {isSubcategory ? 'Subcategory' : 'Category'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Create &quot;<span className="font-medium text-slate-900">{createModal.name}</span>&quot; as a new {isSubcategory ? 'subcategory' : 'category'}.
          </p>

          {isSubcategory && keywordData.category && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Parent Category</span>
              <p className="font-medium text-slate-900">{keywordData.category}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCreateModal({ isOpen: false, type: '', name: '', loading: false })}
              className="flex-1 py-2 px-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={createModal.loading}
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateCategory(createModal.name, isSubcategory ? parentCategory?._id : null)}
              disabled={createModal.loading}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {createModal.loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>Create {isSubcategory ? 'Subcategory' : 'Category'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleKeywordResearch = async () => {
    if (!keywordResearch.url) {
      setError('Please enter a URL to analyze');
      return;
    }
    setError('');
    setKeywordResearch(prev => ({ ...prev, isResearching: true, results: null }));

    try {
      const competitorUrls = keywordResearch.competitorUrls
        ? keywordResearch.competitorUrls.split(',').map(u => u.trim()).filter(u => u)
        : [];

      // Append :online if web search is enabled
      const modelId = useOnlineMode 
        ? `${keywordData.selectedModel}:online`
        : keywordData.selectedModel;

      const res = await fetch('/api/ai/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: keywordResearch.url || undefined,
          competitorUrls: competitorUrls.length > 0 ? competitorUrls : undefined,
          model: modelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to perform keyword research');

      setKeywordResearch(prev => ({
        ...prev,
        results: data.keywords,
        isResearching: false,
        mainTopic: data.keywords.mainTopic || '',
        industry: data.keywords.industry || ''
      }));

      if (data.keywords) {
        // Parse recommended content length
        const recommendedLength = parseInt(data.keywords.contentLength) || 1500;
        const validLength = [1500, 2000, 2500].includes(recommendedLength) ? recommendedLength : 1500;

        setKeywordData(prev => ({
          ...prev,
          primaryKeyword: data.keywords.primaryKeyword || prev.primaryKeyword,
          secondaryKeywords: data.keywords.secondaryKeywords?.join(', ') || prev.secondaryKeywords,
          blogTitle: data.keywords.suggestedTitles?.[0] || prev.blogTitle,
          targetAudience: data.keywords.targetAudience || prev.targetAudience,
          contentLength: validLength,
        }));

        // Auto-create or set category and subcategory
        if (data.keywords.category) {
          await autoCreateAndSetCategory(data.keywords.category, data.keywords.subcategory);
        }
      }
    } catch (err) {
      setError(err.message);
      setKeywordResearch(prev => ({ ...prev, isResearching: false }));
    }
  };

  const autoCreateAndSetCategory = async (categoryName, subcategoryName) => {
    try {
      // Refresh categories first
      await fetchCategories();

      // Check if category exists
      let existingCategory = categories.find(c =>
        c.name.toLowerCase() === categoryName.toLowerCase() && !c.parent
      );

      let categoryId;
      if (!existingCategory) {
        // Create new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName.trim(),
            slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            parent: null,
          }),
        });

        if (res.ok) {
          const newCategory = await res.json();
          categoryId = newCategory._id;
          await fetchCategories();
        }
      } else {
        categoryId = existingCategory._id;
      }

      // Set the category in state
      setKeywordData(prev => ({ ...prev, category: categoryName }));
      setPublishData(prev => ({ ...prev, category: categoryName }));

      // Handle subcategory
      if (subcategoryName && categoryId) {
        await fetchCategories(); // Refresh to get latest
        const updatedCategories = await fetch('/api/categories').then(r => r.json());

        const existingSubcategory = updatedCategories.find(c =>
          c.name.toLowerCase() === subcategoryName.toLowerCase() &&
          c.parent === categoryId
        );

        if (!existingSubcategory) {
          // Create new subcategory
          await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: subcategoryName.trim(),
              slug: subcategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
              parent: categoryId,
            }),
          });
          await fetchCategories();
        }

        setKeywordData(prev => ({ ...prev, subcategory: subcategoryName }));
        setPublishData(prev => ({ ...prev, subcategory: subcategoryName }));
      }
    } catch (err) {
      console.error('Auto-create category error:', err);
      // Don't block the flow if auto-creation fails
    }
  };

  const applyKeyword = (keyword) => {
    setKeywordData(prev => ({ ...prev, primaryKeyword: keyword }));
  };

  const applyTitle = (title) => {
    setKeywordData(prev => ({ ...prev, blogTitle: title }));
  };

  const handleGenerateOutline = async () => {
    if (!keywordData.primaryKeyword) {
      setError('Please enter a primary keyword');
      return;
    }
    if (!keywordData.category || !keywordData.subcategory) {
      setError('Please select category and subcategory');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Append :online if web search is enabled
      const modelId = useOnlineMode 
        ? `${keywordData.selectedModel}:online`
        : keywordData.selectedModel;

      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword: keywordData.primaryKeyword,
          secondaryKeywords: keywordData.secondaryKeywords,
          blogTitle: keywordData.blogTitle,
          targetAudience: keywordData.targetAudience,
          contentLength: keywordData.contentLength,
          tone: keywordData.tone,
          model: modelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outline');
      
      setOutline(data.outline || []);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (outline.length === 0) {
      setError('Please generate an outline first');
      return;
    }
    if (!keywordData.category || !keywordData.subcategory) {
      setError('Please select category and subcategory in Step 1');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Append :online if web search is enabled
      const modelId = useOnlineMode
        ? `${keywordData.selectedModel}:online`
        : keywordData.selectedModel;

      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: keywordData.blogTitle || keywordData.primaryKeyword,
          category: keywordData.category,
          subcategory: keywordData.subcategory,
          outline: outline,
          primaryKeyword: keywordData.primaryKeyword,
          secondaryKeywords: keywordData.secondaryKeywords,
          tone: keywordData.tone,
          contentLength: keywordData.contentLength,
          model: modelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate blog');

      setGeneratedContent(data.blog?.content || '');
      setSeoData(prev => ({
        ...prev,
        metaTitle: data.preview?.seoTitle || keywordData.blogTitle || keywordData.primaryKeyword,
        metaDescription: data.preview?.seoDescription || '',
        slug: data.preview?.slug || generateSlug(keywordData.blogTitle || keywordData.primaryKeyword),
        focusKeyword: keywordData.primaryKeyword,
        featuredImage: data.preview?.featuredImagePrompt || '',
      }));
      setPublishData(prev => ({
        ...prev,
        tags: data.preview?.tags?.join(', ') || '',
        category: data.preview?.category || '',
        subcategory: data.preview?.subcategory || '',
      }));
      fetchCategories();
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Featured image must be less than 5MB');
      return;
    }

    setUploadingFeaturedImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');

      setPublishData(prev => ({ ...prev, featuredImage: data.url }));
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingFeaturedImage(false);
    }
  };

  const handleProcessImageWithAI = async () => {
    setProcessingImageWithAI(true);
    setError('');

    try {
      const prompt =
        keywordData.blogTitle ||
        seoData.metaTitle ||
        keywordData.primaryKeyword ||
        'Professional blog featured image';

      const payload = {
        prompt,
        model: imageModel || undefined,
      };

      if (publishData.featuredImage) {
        payload.imageUrl = publishData.featuredImage;
      }

      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'AI image processing failed');
      }

      setPublishData(prev => ({ ...prev, featuredImage: data.url }));
    } catch (err) {
      setError(err.message || 'AI image processing failed');
    } finally {
      setProcessingImageWithAI(false);
    }
  };

  const handlePreview = () => {
    const category = publishData.category || keywordData.category;
    const subcategory = publishData.subcategory || keywordData.subcategory;
    const slug = seoData.slug;

    if (!category || !subcategory || !slug) {
      setError('Set category, subcategory, and slug before preview.');
      return;
    }

    const previewUrl = `/blog/${generateSlug(category)}/${generateSlug(subcategory)}/${slug}`;
    const previewTab = window.open(previewUrl, '_blank');
    if (!previewTab) {
      setError('Popup blocked. Please allow popups and try again.');
    }
  };

  const handlePublish = async (statusOverride) => {
    setLoading(true);
    try {
      const finalStatus = statusOverride || publishData.status;
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seoData.metaTitle,
          slug: seoData.slug,
          content: generatedContent,
          category: publishData.category,
          subcategory: publishData.subcategory,
          tags: publishData.tags.split(',').map(t => t.trim()).filter(Boolean),
          featuredImage: publishData.featuredImage,
          seoTitle: seoData.metaTitle,
          seoDescription: seoData.metaDescription,
          excerpt: seoData.metaDescription?.substring(0, 150),
          published: finalStatus === 'publish',
        }),
      });

      if (!res.ok) throw new Error('Failed to create blog');
      const blog = await res.json();
      
      window.location.href = `/admin/blogs/edit/${blog.slug}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOutlineSection = () => {
    setOutline([...outline, { title: '', type: 'h2' }]);
  };

  const updateOutlineSection = (index, field, value) => {
    const newOutline = [...outline];
    newOutline[index][field] = value;
    setOutline(newOutline);
  };

  const removeOutlineSection = (index) => {
    setOutline(outline.filter((_, i) => i !== index));
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                currentStep === step.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : loading
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 cursor-pointer hover:bg-slate-200'
              }`}
              onClick={() => !loading && currentStep > step.id && setCurrentStep(step.id)}
            >
              {currentStep > step.id ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.icon}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:inline ${
              currentStep === step.id ? 'text-indigo-600' : 'text-slate-500'
            }`}>
              {step.name}
            </span>
            {index < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      {loading && (
        <div className="mt-2 text-center">
          <span className="text-sm text-indigo-600 font-medium">Processing... Please wait</span>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-xl border border-violet-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-archivo font-semibold text-slate-900">AI Keyword Research</h2>
            <p className="text-sm text-slate-600">Analyze top websites to find the best keywords</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Website URL to Analyze *</label>
            <input
              type="url"
              value={keywordResearch.url}
              onChange={(e) => setKeywordResearch({ ...keywordResearch, url: e.target.value })}
              placeholder="https://example.com/blog-post"
              disabled={loading || keywordResearch.isResearching}
              className="w-full px-3 py-1.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-space-grotesk text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Competitor URLs (optional)</label>
            <input
              type="text"
              value={keywordResearch.competitorUrls}
              onChange={(e) => setKeywordResearch({ ...keywordResearch, competitorUrls: e.target.value })}
              placeholder="https://competitor1.com, https://competitor2.com"
              disabled={loading || keywordResearch.isResearching}
              className="w-full px-3 py-1.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-space-grotesk text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Add multiple URLs separated by commas for better keyword analysis</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <label className="text-sm font-semibold text-indigo-900">AI Model for Analysis & Generation *</label>
          </div>
          {aiModelsLoading ? (
            <div className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-slate-50 text-sm text-slate-500">
              Loading models...
            </div>
          ) : (
            <>
              <select
                value={keywordData.selectedModel}
                onChange={(e) => setKeywordData({ ...keywordData, selectedModel: e.target.value })}
                disabled={keywordResearch.isResearching}
                className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm bg-white disabled:opacity-50"
              >
                {textModels.map((model, index) => (
                  <option key={model._id || model.modelId || index} value={model._id}>
                    {model.name} {model.isDefault ? '(Default)' : ''} [{getModelCapabilityLabel(model)}]
                  </option>
                ))}
              </select>
              {/* Selected Model Details */}
              {(() => {
                const selectedModel = textModels.find(m => m._id === keywordData.selectedModel);
                if (!selectedModel) return null;
                return (
                  <div className="mt-2 p-2 bg-white rounded border border-indigo-100">
                    <div className="flex items-start gap-2">
                      {selectedModel.icon && (
                        <div className="w-8 h-8 flex-shrink-0 bg-slate-50 rounded p-1 flex items-center justify-center">
                          <Image 
                            src={selectedModel.icon} 
                            alt={selectedModel.provider}
                            width={24}
                            height={24}
                            loading="lazy"
                            unoptimized
                            className={`w-full h-full object-contain ${selectedModel.iconClassName || ''}`}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-700 font-medium truncate">{selectedModel.modelId}</p>
                        {selectedModel.permaslug && selectedModel.permaslug !== selectedModel.modelId && (
                          <p className="text-xs text-slate-500 truncate">{selectedModel.permaslug}</p>
                        )}
                        {selectedModel.description && (
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{selectedModel.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedModel.group && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">{selectedModel.group}</span>
                          )}
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded">ctx: {(selectedModel.contextLength || 8192).toLocaleString()}</span>
                          {selectedModel.hasTextOutput && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">text output</span>
                          )}
                          {selectedModel.inputModalities?.map((mod, i) => (
                            <span key={`${mod}-input-${i}`} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded">in: {mod}</span>
                          ))}
                          {selectedModel.outputModalities?.map((mod, i) => (
                            <span key={`${mod}-output-${i}`} className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded">out: {mod}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Web Search Toggle */}
          <div className="mt-3 pt-3 border-t border-indigo-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useOnlineMode}
                  onChange={(e) => setUseOnlineMode(e.target.checked)}
                  disabled={keywordResearch.isResearching}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 disabled:opacity-50"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700">Enable Web Search (Online Mode)</span>
                <p className="text-xs text-slate-500">
                  Adds real-time web data to AI responses. Note: May incur additional costs even with free models.
                  {useOnlineMode && (
                    <span className="text-emerald-600 font-medium ml-1">[Enabled - :online]</span>
                  )}
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </label>
          </div>
        </div>

        <button
          onClick={handleKeywordResearch}
          disabled={keywordResearch.isResearching || !keywordResearch.url}
          className="w-full mt-4 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {keywordResearch.isResearching ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Analyzing Websites...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Research Keywords with AI
            </>
          )}
        </button>

        {keywordResearch.results && (
          <div className="mt-6 space-y-4">
            {/* Auto-Detected Fields */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-emerald-900">Auto-Detected from Website Analysis</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Main Topic</p>
                  <p className="text-sm font-medium text-slate-900">{keywordResearch.mainTopic || keywordResearch.results.mainTopic || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Industry</p>
                  <p className="text-sm font-medium text-slate-900">{keywordResearch.industry || keywordResearch.results.industry || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-emerald-700">
                    {keywordData.category || keywordResearch.results.category || 'N/A'}
                    {keywordData.category && (
                      <span className="text-xs text-emerald-500 ml-1">(auto-created)</span>
                    )}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">Subcategory</p>
                  <p className="text-sm font-medium text-emerald-700">
                    {keywordData.subcategory || keywordResearch.results.subcategory || 'N/A'}
                    {keywordData.subcategory && (
                      <span className="text-xs text-emerald-500 ml-1">(auto-created)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-violet-100">
                <p className="text-xs text-slate-500 mb-1">Search Intent</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  keywordResearch.results.searchIntent === 'informational' ? 'bg-blue-100 text-blue-700' :
                  keywordResearch.results.searchIntent === 'transactional' ? 'bg-green-100 text-green-700' :
                  keywordResearch.results.searchIntent === 'commercial' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {keywordResearch.results.searchIntent || 'N/A'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-violet-100">
                <p className="text-xs text-slate-500 mb-1">Competition</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  keywordResearch.results.competitionLevel === 'low' ? 'bg-green-100 text-green-700' :
                  keywordResearch.results.competitionLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {keywordResearch.results.competitionLevel || 'N/A'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-violet-100 col-span-2">
                <p className="text-xs text-slate-500 mb-1">Target Audience</p>
                <p className="text-sm font-medium text-slate-900">{keywordResearch.results.targetAudience || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Primary Keyword</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 px-4 py-2 bg-violet-50 border border-violet-200 rounded-lg font-medium text-violet-900">
                  {keywordResearch.results.primaryKeyword}
                </span>
                <button onClick={() => applyKeyword(keywordResearch.results.primaryKeyword)} className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 cursor-pointer">
                  Use
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Suggested Titles</p>
              <div className="space-y-2">
                {keywordResearch.results.suggestedTitles?.slice(0, 3).map((title, i) => (
                  <div key={`${title}-${i}`} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                      {title}
                    </span>
                    <button onClick={() => applyTitle(title)} className="px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-lg hover:bg-indigo-200 cursor-pointer">
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Secondary Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywordResearch.results.secondaryKeywords?.map((kw, i) => (
                  <button
                    key={`${kw}-${i}`}
                    onClick={() => setKeywordData(prev => ({ ...prev, secondaryKeywords: prev.secondaryKeywords ? `${prev.secondaryKeywords}, ${kw}` : kw }))}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>

            {keywordResearch.results.longTailKeywords?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Long-tail Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywordResearch.results.longTailKeywords?.slice(0, 6).map((kw, i) => (
                    <button
                      key={`${kw}-${i}`}
                      onClick={() => setKeywordData(prev => ({ ...prev, secondaryKeywords: prev.secondaryKeywords ? `${prev.secondaryKeywords}, ${kw}` : kw }))}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {keywordResearch.results.seoRecommendations?.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">SEO Recommendations</p>
                <ul className="space-y-1">
                  {keywordResearch.results.seoRecommendations.map((rec, i) => (
                    <li key={`${rec}-${i}`} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-xl font-archivo font-semibold text-slate-900 mb-4">Step 1 — Keyword Input</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableDropdown
              label="Category * (auto-detected from URL)"
              value={keywordData.category}
              onChange={(value) => setKeywordData({ ...keywordData, category: value, subcategory: '' })}
              options={topLevelCategories}
              placeholder={keywordResearch.results?.category ? keywordResearch.results.category : "Will be auto-detected from URL"}
              onCreateNew={(name) => openCreateModal('category', name)}
              createLabel="Create New Category"
            />
            {keywordData.category && keywordResearch.results?.category && (
              <p className="text-xs text-emerald-600 mt-1">Auto-detected: {keywordResearch.results.category}</p>
            )}
          </div>
          <div>
            <SearchableDropdown
              label="Subcategory * (auto-detected from URL)"
              value={keywordData.subcategory}
              onChange={(value) => setKeywordData({ ...keywordData, subcategory: value })}
              options={keywordData.category ? getSubcategories(categories.find(c => c.name === keywordData.category)?._id) : []}
              placeholder={keywordResearch.results?.subcategory ? keywordResearch.results.subcategory : (keywordData.category ? "Will be auto-detected" : "Select Category first")}
              disabled={!keywordData.category}
              onCreateNew={(name) => openCreateModal('subcategory', name)}
              createLabel="Create New Subcategory"
            />
            {keywordData.subcategory && keywordResearch.results?.subcategory && (
              <p className="text-xs text-emerald-600 mt-1">Auto-detected: {keywordResearch.results.subcategory}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Keyword *</label>
            <input
              type="text"
              value={keywordData.primaryKeyword}
              onChange={(e) => setKeywordData({ ...keywordData, primaryKeyword: e.target.value })}
              placeholder="Best React SEO Practices"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blog Title</label>
            <input
              type="text"
              value={keywordData.blogTitle}
              onChange={(e) => setKeywordData({ ...keywordData, blogTitle: e.target.value })}
              placeholder="Best React SEO Practices in 2024"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Keywords</label>
            <input
              type="text"
              value={keywordData.secondaryKeywords}
              onChange={(e) => setKeywordData({ ...keywordData, secondaryKeywords: e.target.value })}
              placeholder="React SEO, React Optimization, Web Performance"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience (auto-detected)</label>
            <input
              type="text"
              value={keywordData.targetAudience}
              onChange={(e) => setKeywordData({ ...keywordData, targetAudience: e.target.value })}
              placeholder="Will be auto-detected from URL analysis"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
            {keywordData.targetAudience && keywordResearch.results?.targetAudience && (
              <p className="text-xs text-emerald-600 mt-1">Auto-detected from URL analysis</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content Tone</label>
            <select
              value={keywordData.tone}
              onChange={(e) => setKeywordData({ ...keywordData, tone: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            >
              {TONE_OPTIONS.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content Length (AI recommended)</label>
            <select
              value={keywordData.contentLength}
              onChange={(e) => setKeywordData({ ...keywordData, contentLength: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            >
              {LENGTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {keywordResearch.results?.contentLength && (
              <p className="text-xs text-emerald-600 mt-1">AI recommends: {keywordResearch.results.contentLength} words</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              AI Model for Content Generation *
              <span className="ml-1 text-xs text-indigo-600 font-normal">(select before generating)</span>
            </label>
            {aiModelsLoading ? (
              <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
                Loading models...
              </div>
            ) : (
              <>
                <select
                  value={keywordData.selectedModel}
                  onChange={(e) => setKeywordData({ ...keywordData, selectedModel: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
                >
                  {textModels.map((model, index) => (
                    <option key={model._id || model.modelId || index} value={model._id}>
                      {model.name} [{getModelCapabilityLabel(model)}] {model.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {textModels.find(m => m._id === keywordData.selectedModel)?.description || 'Select a free text model'}
                </p>
              </>
            )}
          </div>

          {/* Web Search Toggle */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useOnlineMode}
                  onChange={(e) => setUseOnlineMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700">Enable Web Search (Online Mode)</span>
                <p className="text-xs text-slate-500">
                  Adds real-time web data to AI responses. Note: May incur additional costs.
                  {useOnlineMode && (
                    <span className="text-emerald-600 font-medium ml-1">[:online enabled]</span>
                  )}
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={handleGenerateOutline}
            disabled={loading || !keywordData.primaryKeyword || !keywordData.category || !keywordData.subcategory}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? 'Generating Outline...' : 'Generate Outline →'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-archivo font-semibold text-slate-900">Step 2 — AI Blog Outline</h2>
        <button
          onClick={() => setCurrentStep(1)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
        >
          ← Edit Keywords
        </button>
      </div>
      
      <div className="border rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {outline.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No outline generated yet. Go back to Step 1.</p>
        ) : (
          outline.map((section, index) => (
            <div key={`${section.type}-${section.title}-${index}`} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                section.type === 'h1' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {section.type.toUpperCase()}
              </span>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateOutlineSection(index, 'title', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
                placeholder="Section title"
              />
              <button
                onClick={() => removeOutlineSection(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addOutlineSection}
          className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
        >
          + Add Section
        </button>
        <button
          onClick={handleGenerateOutline}
          disabled={loading}
          className="flex-1 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors cursor-pointer"
        >
          Regenerate Outline
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={handleGenerateBlog}
          disabled={loading || outline.length === 0}
          className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? 'Generating Blog...' : 'Next → Generate Blog'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-archivo font-semibold text-slate-900">Step 3 — AI Blog Generator</h2>
          <button
            onClick={() => setCurrentStep(2)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            ← Edit Outline
          </button>
        </div>
        
        <div className="border rounded-xl p-4 min-h-[500px]">
          <ReactQuill
            value={generatedContent}
            onChange={setGeneratedContent}
            theme="snow"
            className="font-space-grotesk h-[400px]"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'code-block'],
                ['blockquote'],
                ['clean']
              ],
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={handleGenerateBlog} disabled={loading} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
            Regenerate Section
          </button>
          <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
            Improve Content
          </button>
          <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
            Expand Paragraph
          </button>
          <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
            Simplify Text
          </button>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(2)}
            disabled={loading}
            className="py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            disabled={loading}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next → SEO Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-xl font-archivo font-semibold text-slate-900 mb-4">Step 4 — SEO Optimization Panel</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Meta Title</label>
            <input
              type="text"
              value={seoData.metaTitle}
              onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
            <span className="text-xs text-slate-500">{seoData.metaTitle.length}/60</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
            <input
              type="text"
              value={seoData.slug}
              onChange={(e) => setSeoData({ ...seoData, slug: generateSlug(e.target.value) })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
            <textarea
              value={seoData.metaDescription}
              onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
            <span className="text-xs text-slate-500">{seoData.metaDescription.length}/160</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Focus Keyword</label>
            <input
              type="text"
              value={seoData.focusKeyword}
              onChange={(e) => setSeoData({ ...seoData, focusKeyword: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Canonical URL</label>
            <input
              type="url"
              value={seoData.canonicalUrl}
              onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
              placeholder="https://www.manjuhiremath.in/blog/category/subcategory/slug"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">SEO Score</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle
                  cx="48" cy="48" r="40"
                  stroke={seoScore.score >= 80 ? '#22c55e' : seoScore.score >= 60 ? '#eab308' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${seoScore.score * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900">
                {seoScore.score}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {seoScore.checks?.map((check, i) => (
              <div key={`${check.name}-${i}`} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{check.name}</span>
                <span className={`w-3 h-3 rounded-full ${
                  check.status === 'good' ? 'bg-green-500' : check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(3)}
            className="py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(5)}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Next → Publish
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-archivo font-semibold text-slate-900">Step 5 — Publish Panel</h2>
          <button
            onClick={() => setCurrentStep(4)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            ← Edit SEO
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={publishData.category}
              onChange={(e) => setPublishData({ ...publishData, category: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            >
              <option value="">Select Category</option>
              {categories.filter(c => !c.parent).map((cat, index) => (
                <option key={cat._id || cat.slug || `${cat.name}-${index}`} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
            <select
              value={publishData.subcategory}
              onChange={(e) => setPublishData({ ...publishData, subcategory: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            >
              <option value="">Select Subcategory</option>
              {categories.filter(c => c.parent).map((cat, index) => (
                <option key={cat._id || cat.slug || `${cat.name}-${index}`} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
            <input
              type="text"
              value={publishData.tags}
              onChange={(e) => setPublishData({ ...publishData, tags: e.target.value })}
              placeholder="React, SEO, Web Development"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image Generation Model (Free)</label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            >
              {imageModels.length === 0 ? (
                <option value="">No free image models found</option>
              ) : (
                imageModels.map((model, index) => (
                  <option key={model._id || model.modelId || index} value={model._id}>
                    {model.name} [{getModelCapabilityLabel(model)}] {model.isDefault ? '(Default)' : ''}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {imageModels.find((m) => m._id === imageModel)?.description || 'Select free image-generation model'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Featured Image URL</label>
            <input
              type="url"
              value={publishData.featuredImage}
              onChange={(e) => setPublishData({ ...publishData, featuredImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-200">
                {uploadingFeaturedImage ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  disabled={uploadingFeaturedImage || loading}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleProcessImageWithAI}
                disabled={processingImageWithAI || loading}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingImageWithAI ? 'Processing...' : 'Process with AI + Cloudinary'}
              </button>
            </div>
            {publishData.featuredImage && (
              <p className="mt-1 text-xs text-slate-500 break-all">
                Stored URL: {publishData.featuredImage}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Publish Date</label>
            <input
              type="date"
              value={publishData.publishDate}
              onChange={(e) => setPublishData({ ...publishData, publishDate: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space-grotesk text-sm"
            />
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Use <span className="font-medium text-slate-700">Save Draft</span> or <span className="font-medium text-slate-700">Publish Blog</span> below. Status is set by the action you choose.
        </p>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handlePreview}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => handlePublish('draft')}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handlePublish('publish')}
            disabled={loading}
            className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500">Title:</span>
              <p className="font-medium text-slate-900">{seoData.metaTitle || 'Not set'}</p>
            </div>
            <div>
              <span className="text-slate-500">Slug:</span>
              <p className="font-medium text-slate-900">/{seoData.slug || 'not-set'}</p>
            </div>
            <div>
              <span className="text-slate-500">Category:</span>
              <p className="font-medium text-slate-900">{publishData.category || 'Not set'}</p>
            </div>
            <div>
              <span className="text-slate-500">Tags:</span>
              <p className="font-medium text-slate-900">{publishData.tags || 'None'}</p>
            </div>
            <div>
              <span className="text-slate-500">Words:</span>
              <p className="font-medium text-slate-900">{wordCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">SEO Score:</span>
              <p className={`font-medium ${seoScore.score >= 80 ? 'text-green-600' : seoScore.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {seoScore.score}/100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable} min-h-screen bg-[#FAFAFA] p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-archivo font-bold text-[#18181B]">AI Blog Generator</h1>
          <Link href="/admin/blogs" className="text-indigo-600 hover:text-indigo-800 font-space-grotesk cursor-pointer">
            ← Back to Blogs
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700 cursor-pointer">Dismiss</button>
          </div>
        )}

        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {renderCreateModal()}
      </div>
    </div>
  );
}
