import { useState, useMemo, KeyboardEvent, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { Note } from '@/types';
import {
  NotebookPen,
  Plus,
  Trash2,
  Tag,
  Calendar,
  Home as HomeIcon,
  Camera,
  X,
  Check,
  Upload,
  ZoomIn,
} from 'lucide-react';

export default function Notes() {
  const { notes, properties, addNote, deleteNote } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filterTag) {
      result = result.filter((n) => n.tags.includes(filterTag));
    }
    if (filterPropertyId) {
      result = result.filter((n) => n.propertyId === filterPropertyId);
    }
    return result;
  }, [notes, filterTag, filterPropertyId]);

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setScreenshot(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateCapture = () => {
    const placeholderImages = [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20living%20room%20interior%20design&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20bedroom%20interior%20with%20large%20windows%20natural%20light&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20kitchen%20interior%20design%20island%20stainless%20steel&image_size=square',
    ];
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setScreenshot(randomImage);
  };

  const handleSave = () => {
    if (!selectedPropertyId || !content.trim()) return;

    const property = properties.find((p) => p.id === selectedPropertyId);
    if (!property) return;

    addNote({
      propertyId: selectedPropertyId,
      propertyTitle: property.title,
      content: content.trim(),
      tags,
      screenshot: screenshot || undefined,
    });

    setSelectedPropertyId('');
    setContent('');
    setTags([]);
    setTagInput('');
    setScreenshot(null);
    setShowForm(false);
  };

  const resetForm = () => {
    setSelectedPropertyId('');
    setContent('');
    setTags([]);
    setTagInput('');
    setScreenshot(null);
    setShowForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-24 pb-12 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-400 to-aurora-600 flex items-center justify-center shadow-lg shadow-aurora-500/30">
              <NotebookPen className="w-6 h-6 text-space-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient font-display tracking-wider">看房笔记</h1>
              <p className="text-metal-400 text-sm mt-0.5">记录看房过程中的每一个细节</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            新建笔记
          </button>
        </div>

        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HomeIcon className="w-4 h-4 text-aurora-400" />
                <span className="text-metal-300 text-sm font-medium">房源筛选</span>
              </div>
              <select
                value={filterPropertyId}
                onChange={(e) => setFilterPropertyId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">全部房源</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            {allTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-aurora-400" />
                  <span className="text-metal-300 text-sm font-medium">标签筛选</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterTag(null)}
                    className={`tag-chip cursor-pointer ${!filterTag ? 'tag-chip-active' : ''}`}
                  >
                    全部
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className={`tag-chip cursor-pointer ${filterTag === tag ? 'tag-chip-active' : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <NotebookPen className="w-16 h-16 text-metal-500 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-metal-300 text-lg mb-2">暂无笔记</p>
            <p className="text-metal-500 text-sm">点击"新建笔记"开始记录</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotes.map((note: Note) => (
              <div key={note.id} className="glass-card glass-card-hover rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <HomeIcon className="w-4 h-4 text-aurora-400 flex-shrink-0" />
                    <span className="text-metal-100 font-medium truncate">{note.propertyTitle}</span>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 rounded-lg text-metal-400 hover:text-coral-500 hover:bg-coral-500/10 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-metal-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap line-clamp-3">
                  {note.content}
                </p>

                <div className="flex gap-3 mb-4">
                  {note.screenshot ? (
                    <div
                      className="relative w-28 h-20 rounded-lg overflow-hidden border border-aurora-500/20 cursor-pointer hover:border-aurora-500/50 transition-all group"
                      onClick={() => setPreviewImage(note.screenshot!)}
                    >
                      <img src={note.screenshot} alt="笔记截图" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-space-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex-1 flex flex-wrap gap-1.5 content-start">
                    {note.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center text-metal-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-space-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img src={previewImage} alt="截图预览" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-space-800 border border-metal-500/50 flex items-center justify-center text-metal-300 hover:text-white hover:border-coral-500/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient font-display">新建笔记</h2>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-lg text-metal-400 hover:text-metal-200 hover:bg-metal-500/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-metal-300 text-sm font-medium mb-2">关联房源</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="input-field"
                >
                  <option value="">请选择房源</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-metal-300 text-sm font-medium mb-2">笔记内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="记录你的看房感受、疑问、关注点..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-metal-300 text-sm font-medium mb-2">
                  标签 <span className="text-metal-500 font-normal">（输入后按回车添加）</span>
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签后按回车"
                  className="input-field"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((tag) => (
                      <span key={tag} className="tag-chip items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-coral-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-metal-300 text-sm font-medium mb-2">
                  截图 <span className="text-metal-500 font-normal">（支持上传本地图片或模拟截图）</span>
                </label>
                {screenshot ? (
                  <div className="relative rounded-xl overflow-hidden border border-aurora-500/30">
                    <img src={screenshot} alt="预览截图" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => setScreenshot(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-space-900/80 backdrop-blur-sm flex items-center justify-center text-metal-300 hover:text-coral-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl bg-space-800/50 border border-dashed border-metal-500/30 flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg hover:bg-aurora-500/10 text-metal-400 hover:text-aurora-400 transition-all"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">上传图片</span>
                      </button>
                      <button
                        onClick={handleSimulateCapture}
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg hover:bg-aurora-500/10 text-metal-400 hover:text-aurora-400 transition-all"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-xs">模拟截图</span>
                      </button>
                    </div>
                    <span className="text-metal-500 text-xs">支持 JPG、PNG 格式，最大 5MB</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedPropertyId || !content.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                保存笔记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
