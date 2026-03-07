'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Archivo, Space_Grotesk } from 'next/font/google';

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

const ReactQuill = dynamic(
  () => import('react-quill-new').then((mod) => {
    const Quill = mod.default.Quill || mod.Quill;
    if (Quill && !Quill.imports['formats/table-embed']) {
      const BlockEmbed = Quill.import('blots/block/embed');

      class TableEmbed extends BlockEmbed {
        static create(value) {
          const node = super.create();
          node.setAttribute('contenteditable', 'false');
          node.innerHTML = value || '';
          node.style.margin = '16px 0';
          return node;
        }
        static value(node) {
          return node.innerHTML;
        }
      }
      TableEmbed.blotName = 'table-embed';
      TableEmbed.tagName = 'DIV';
      TableEmbed.className = 'ql-table-embed';

      Quill.register(TableEmbed, true);
    }
    return mod;
  }),
  { ssr: false }
);
import 'react-quill-new/dist/quill.snow.css';

function generateTableHTML(rows, cols) {
  let html = '<table style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr>';
  for (let c = 0; c < cols; c++) {
    html += '<th style="border:1px solid #d1d5db;padding:8px 12px;background-color:#f3f4f6;text-align:left;font-weight:600;">Header ' + (c + 1) + '</th>';
  }
  html += '</tr></thead>';
  html += '<tbody>';
  for (let r = 1; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += '<td style="border:1px solid #d1d5db;padding:8px 12px;">Cell</td>';
    }
    html += '</tr>';
  }
  html += '</tbody>';
  html += '</table>';
  return html;
}

function SearchableDropdown({ label, value, onChange, options, placeholder, disabled, onCreateNew, createLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-space-grotesk bg-white cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[#18181B] text-sm' : 'text-[#3F3F46] text-sm'}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-[#3F3F46] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#3F3F46]/20 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-[#3F3F46]/10">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="py-1">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-4 py-3 text-sm text-[#3F3F46] text-center">
                No options found
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => handleSelect(option.name)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2563EB]/10 transition-colors ${
                      value === option.name ? 'bg-[#2563EB]/10 text-[#2563EB] font-medium' : 'text-[#18181B]'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
                {showCreateOption && onCreateNew && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full px-4 py-3 text-left text-sm text-[#2563EB] hover:bg-[#2563EB]/10 border-t border-[#3F3F46]/10 font-medium flex items-center gap-2"
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

function CreateBlogInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quillRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    featuredImage: '',
    excerpt: '',
    content: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categories, setCategories] = useState([]);
  const [createModal, setCreateModal] = useState({ isOpen: false, type: '', name: '', loading: false });

  // Load draft data from localStorage if source=scrape
  useEffect(() => {
    if (searchParams.get('source') === 'scrape') {
      const draftStr = localStorage.getItem('blogDraftContent');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          setFormData(prev => ({
            ...prev,
            title: draft.title || '',
            excerpt: draft.excerpt || '',
            content: draft.content || '',
            tags: draft.tags ? draft.tags.join(', ') : '',
            featuredImage: draft.featuredImage || '',
            seoTitle: draft.title || '',
            seoDescription: draft.excerpt ? draft.excerpt.substring(0, 160) : '',
          }));
        } catch(e) {
          console.error("Failed to parse draft data", e);
        }
      }
    }
  }, [searchParams]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async (name) => {
    setCreateModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        }),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const newCategory = await res.json();
      await fetchCategories();

      setFormData(prev => ({ ...prev, category: newCategory.name }));

      setCreateModal({ isOpen: false, type: '', name: '', loading: false });
    } catch (err) {
      console.error('Failed to create category:', err);
      setCreateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openCreateModal = (name) => {
    setCreateModal({ isOpen: true, type: 'category', name, loading: false });
  };

  const parentCategories = categories.filter(c => !c.parent);

  const parseTableHTML = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const table = temp.querySelector('table');
    if (!table) return null;

    const rows = [];
    let hasHeader = false;

    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
      hasHeader = true;
      const cells = [];
      headerRow.querySelectorAll('th, td').forEach(cell => cells.push(cell.textContent || ''));
      rows.push(cells);
    }

    table.querySelectorAll('tbody tr').forEach(tr => {
      const cells = [];
      tr.querySelectorAll('td, th').forEach(cell => cells.push(cell.textContent || ''));
      rows.push(cells);
    });

    if (rows.length === 0) {
      table.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td, th').forEach(cell => cells.push(cell.textContent || ''));
        rows.push(cells);
      });
    }

    return { data: rows, hasHeader };
  };

  const buildTableHTML = (data, hasHeader) => {
    if (!data || data.length === 0) return '';
    let html = '<table style="width:100%;border-collapse:collapse;">';
    const startRow = hasHeader ? 1 : 0;

    if (hasHeader && data.length > 0) {
      html += '<thead><tr>';
      data[0].forEach(cell => {
        html += `<th style="border:1px solid #d1d5db;padding:8px 12px;background-color:#f3f4f6;text-align:left;font-weight:600;">${cell}</th>`;
      });
      html += '</tr></thead>';
    }

    html += '<tbody>';
    for (let r = startRow; r < data.length; r++) {
      html += '<tr>';
      data[r].forEach(cell => {
        html += `<td style="border:1px solid #d1d5db;padding:8px 12px;">${cell}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  };

  useEffect(() => {
    const handleDblClick = (e) => {
      const embedNode = e.target.closest('.ql-table-embed');
      if (!embedNode) return;

      const parsed = parseTableHTML(embedNode.innerHTML);
      if (parsed) {
        setEditingTable({ node: embedNode, ...parsed });
      }
    };

    const editorContainer = document.querySelector('.ql-editor');
    if (editorContainer) {
      editorContainer.addEventListener('dblclick', handleDblClick);
      return () => editorContainer.removeEventListener('dblclick', handleDblClick);
    }
  });

  const updateEditCell = (rowIdx, colIdx, value) => {
    setEditingTable(prev => {
      const newData = prev.data.map(row => [...row]);
      newData[rowIdx][colIdx] = value;
      return { ...prev, data: newData };
    });
  };

  const addEditRow = () => {
    setEditingTable(prev => {
      const cols = prev.data[0]?.length || 3;
      const newRow = Array(cols).fill('');
      return { ...prev, data: [...prev.data, newRow] };
    });
  };

  const removeEditRow = (rowIdx) => {
    setEditingTable(prev => {
      if (prev.data.length <= 1) return prev;
      const newData = prev.data.filter((_, i) => i !== rowIdx);
      return { ...prev, data: newData };
    });
  };

  const addEditCol = () => {
    setEditingTable(prev => {
      const newData = prev.data.map(row => [...row, '']);
      return { ...prev, data: newData };
    });
  };

  const removeEditCol = (colIdx) => {
    setEditingTable(prev => {
      if ((prev.data[0]?.length || 0) <= 1) return prev;
      const newData = prev.data.map(row => row.filter((_, i) => i !== colIdx));
      return { ...prev, data: newData };
    });
  };

  const saveEditedTable = () => {
    if (!editingTable) return;
    const newHTML = buildTableHTML(editingTable.data, editingTable.hasHeader);

    if (editingTable.node) {
      editingTable.node.innerHTML = newHTML;

      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        const updatedContent = quill.root.innerHTML;
        setFormData(prev => ({ ...prev, content: updatedContent }));
      }
    }

    setEditingTable(null);
  };

  const deleteEditedTable = () => {
    if (!editingTable?.node) return;
    editingTable.node.remove();

    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      setFormData(prev => ({ ...prev, content: quill.root.innerHTML }));
    }
    setEditingTable(null);
  };

  useEffect(() => {
    if (formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const insertTable = () => {
    const tableHTML = generateTableHTML(tableRows, tableCols);
    
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      quill.insertEmbed(index, 'table-embed', tableHTML, 'user');
      quill.setSelection(index + 1, 0);
    } else {
      const wrappedHTML = `<div class="ql-table-embed" contenteditable="false">${tableHTML}</div><p><br></p>`;
      setFormData(prev => ({ ...prev, content: prev.content + wrappedHTML }));
    }
    
    setShowTableModal(false);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleEditorDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        continue;
      }
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json();
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            const index = range ? range.index : quill.getLength();
            quill.insertEmbed(index, 'image', data.url, 'user');
            quill.setSelection(index + 1, 0);
          } else {
            const imgTag = `<p><img src="${data.url}" alt="Image" /></p><p><br></p>`;
            setFormData(prev => ({ ...prev, content: prev.content + imgTag }));
          }
        }
      } catch (err) {
        setUploadError('Image upload failed');
      }
    }
    setUploading(false);
  };

  const handleEditorDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleEditorDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const [showReorder, setShowReorder] = useState(false);
  const [reorderBlocks, setReorderBlocks] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);

  const openReorderModal = () => {
    const temp = document.createElement('div');
    temp.innerHTML = formData.content || '';
    const blocks = [];
    temp.childNodes.forEach(node => {
      if (node.nodeType === 1) {
        blocks.push({ html: node.outerHTML, tag: node.tagName, preview: node.textContent?.slice(0, 80) || '' });
      }
    });
    setReorderBlocks(blocks);
    setShowReorder(true);
  };

  const handleBlockDragStart = (idx) => {
    setDragIdx(idx);
  };

  const handleBlockDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newBlocks = [...reorderBlocks];
    const [moved] = newBlocks.splice(dragIdx, 1);
    newBlocks.splice(idx, 0, moved);
    setReorderBlocks(newBlocks);
    setDragIdx(idx);
  };

  const handleBlockDragEnd = () => {
    setDragIdx(null);
  };

  const removeReorderBlock = (idx) => {
    setReorderBlocks(prev => prev.filter((_, i) => i !== idx));
  };

  const saveReorder = () => {
    const newContent = reorderBlocks.map(b => b.html).join('');
    setFormData(prev => ({ ...prev, content: newContent }));
    setShowReorder(false);
  };

  const getBlockIcon = (tag) => {
    switch(tag) {
      case 'H1': case 'H2': case 'H3': return 'H';
      case 'P': return '¶';
      case 'DIV': return '☐';
      case 'UL': case 'OL': return '☰';
      case 'BLOCKQUOTE': return '❝';
      default: return '•';
    }
  };

  const getBlockLabel = (block) => {
    if (block.html.includes('<img')) return '🖼️ Image';
    if (block.html.includes('ql-table-embed')) return '📊 Table';
    if (block.tag === 'H1' || block.tag === 'H2' || block.tag === 'H3') return `${block.tag} — ${block.preview}`;
    if (block.tag === 'UL' || block.tag === 'OL') return `List — ${block.preview}`;
    if (block.tag === 'BLOCKQUOTE') return `Quote — ${block.preview}`;
    return block.preview || '(empty block)';
  };

  const handleImageUploadInContent = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        const imgTag = `<p><img src="${data.url}" alt="Image" class="img-responsive" /></p><p><br></p>`;
        setFormData(prev => ({ ...prev, content: prev.content + imgTag }));
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (res.ok) {
        router.push('/admin/blog/blogs');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to create blog');
      }
    } catch (error) {
      setError('An error occurred while creating the blog');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    table: {
      rows: 10,
      cols: 5,
    },
  };

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-archivo font-bold text-[#18181B]">Create New Blog</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="auto-generated-slug"
              />
            </div>

            <div>
              <SearchableDropdown
                label="Category *"
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                options={parentCategories}
                placeholder="Select or create category"
                onCreateNew={(name) => openCreateModal(name)}
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk disabled:opacity-50"
                />
                {uploading && <p className="text-sm text-[#2563EB]">Uploading...</p>}
                {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                {formData.featuredImage && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      name="featuredImage"
                      value={formData.featuredImage}
                      onChange={handleChange}
                      className="flex-1 px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      className="px-3 py-1.5 text-red-600 hover:text-red-800 font-space-grotesk cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="javascript, react, tutorial (comma-separated)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="Brief summary of the blog post"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
              Content *
            </label>
            <div
              className={`border rounded-md mb-2 relative transition-colors ${isDraggingOver ? 'border-[#2563EB] border-2 border-dashed bg-blue-50/30' : 'border-[#3F3F46]/20'}`}
              onDrop={handleEditorDrop}
              onDragOver={handleEditorDragOver}
              onDragLeave={handleEditorDragLeave}
            >
              {isDraggingOver && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/60 rounded-md pointer-events-none">
                  <div className="flex items-center gap-2 text-[#2563EB] font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Drop image here
                  </div>
                </div>
              )}
              <ReactQuill
                ref={quillRef}
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                theme="snow"
                placeholder="Write your blog content here... (drag & drop images supported)"
                className="font-space-grotesk"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer font-space-grotesk"
              >
                + Insert Table
              </button>
              <label className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer font-space-grotesk">
                + Insert Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadInContent}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={openReorderModal}
                disabled={!formData.content}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer font-space-grotesk disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ↕ Reorder Blocks
              </button>
              {uploading && <span className="text-sm text-[#2563EB] py-1.5">Uploading...</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="SEO optimized title"
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                SEO Description
              </label>
              <input
                type="text"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                placeholder="SEO meta description"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-[#3F3F46]/20 rounded"
            />
            <label className="ml-2 block text-sm font-space-grotesk text-[#18181B]">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-[#3F3F46]/10">
            <button
              type="button"
              onClick={() => router.push('/admin/blog/blogs')}
              className="px-6 py-2 border border-[#3F3F46]/20 text-[#18181B] rounded-md hover:bg-[#3F3F46]/5 transition-colors duration-200 cursor-pointer font-space-grotesk"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer font-space-grotesk"
            >
              {loading ? 'Creating...' : 'Create Blog'}
            </button>
          </div>
        </form>

        {showTableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-archivo font-semibold text-[#18181B] mb-4">Insert Table</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#18181B] mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#18181B] mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-[#18181B] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={insertTable}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {editingTable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-archivo font-semibold text-[#18181B]">Edit Table</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addEditCol}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer"
                  >
                    + Column
                  </button>
                  <button
                    type="button"
                    onClick={addEditRow}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer"
                  >
                    + Row
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {editingTable.data.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            style={{
                              border: '1px solid #d1d5db',
                              padding: '4px',
                              background: editingTable.hasHeader && rowIdx === 0 ? '#f3f4f6' : 'white',
                            }}
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateEditCell(rowIdx, colIdx, e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border-0 outline-none bg-transparent"
                              style={{ fontWeight: editingTable.hasHeader && rowIdx === 0 ? '600' : '400' }}
                              placeholder={editingTable.hasHeader && rowIdx === 0 ? 'Header' : 'Cell'}
                            />
                          </td>
                        ))}
                        <td style={{ border: 'none', padding: '4px', width: '30px' }}>
                          {editingTable.data.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditRow(rowIdx)}
                              className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                              title="Remove row"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      {editingTable.data[0]?.map((_, colIdx) => (
                        <td key={colIdx} style={{ border: 'none', padding: '4px', textAlign: 'center' }}>
                          {(editingTable.data[0]?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditCol(colIdx)}
                              className="text-red-400 hover:text-red-600 text-xs cursor-pointer"
                              title="Remove column"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={deleteEditedTable}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer text-sm"
                >
                  Delete Table
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTable(null)}
                    className="px-4 py-2 text-[#18181B] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEditedTable}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                  >
                    Save Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .ql-table-embed {
            cursor: pointer;
            border-radius: 4px;
            transition: outline 0.15s ease;
            position: relative;
          }
          .ql-table-embed:hover {
            outline: 2px solid #2563EB;
            outline-offset: 2px;
          }
          .ql-table-embed:hover::after {
            content: 'Double-click to edit';
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            background: #18181B;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            pointer-events: none;
          }
        `}</style>

        {showReorder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-archivo font-semibold text-[#18181B]">Reorder Content Blocks</h3>
                <span className="text-xs text-[#3F3F46]">{reorderBlocks.length} blocks</span>
              </div>
              <p className="text-xs text-[#3F3F46] mb-3">Drag blocks to reorder. Click ✕ to remove a block.</p>
              
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {reorderBlocks.length === 0 ? (
                  <p className="text-center text-[#3F3F46] py-8">No content blocks found.</p>
                ) : (
                  reorderBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleBlockDragStart(idx)}
                      onDragOver={(e) => handleBlockDragOver(e, idx)}
                      onDragEnd={handleBlockDragEnd}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md border transition-all cursor-grab active:cursor-grabbing select-none ${
                        dragIdx === idx 
                          ? 'border-[#2563EB] bg-blue-50 shadow-sm' 
                          : 'border-[#3F3F46]/15 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[#3F3F46]/40 text-sm flex-shrink-0 cursor-grab">⠿</span>
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-[#3F3F46] flex-shrink-0">
                        {getBlockIcon(block.tag)}
                      </span>
                      <span className="flex-1 text-sm text-[#18181B] truncate">
                        {getBlockLabel(block)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeReorderBlock(idx); }}
                        className="text-red-300 hover:text-red-500 text-sm flex-shrink-0 cursor-pointer"
                        title="Remove block"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#3F3F46]/10">
                <button
                  type="button"
                  onClick={() => setShowReorder(false)}
                  className="px-4 py-2 text-[#18181B] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveReorder}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  Apply Order
                </button>
              </div>
            </div>
          </div>
        )}

        {createModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-[#18181B] mb-2">
                Create New Category
              </h3>
              <p className="text-sm text-[#3F3F46] mb-4">
                Create &quot;<span className="font-medium text-[#18181B]">{createModal.name}</span>&quot; as a new category.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCreateModal({ isOpen: false, type: '', name: '', loading: false })}
                  className="flex-1 py-2 px-4 border border-[#3F3F46]/20 text-[#18181B] rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={createModal.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateCategory(createModal.name)}
                  disabled={createModal.loading}
                  className="flex-1 py-2 px-4 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
                    <>Create Category</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateBlog() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBlogInner />
    </Suspense>
  );
}
