import { useState, useMemo, KeyboardEvent } from 'react';
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
} from 'lucide-react';

export default function Notes() {
  const { notes, properties, addNote, deleteNote } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!filterTag) return notes;
    return notes.filter((n) => n.tags.includes(filterTag));
  }, [notes, filterTag]);

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

  const handleSave = () => {
    if (!selectedPropertyId || !content.trim()) return;

    const property = properties.find((p) => p.id === selectedPropertyId);
    if (!property) return;

    addNote({
      propertyId: selectedPropertyId,
      propertyTitle: property.title,
      content: content.trim(),
      tags,
    });

    setSelectedPropertyId('');
    setContent('');
    setTags([]);
    setTagInput('');
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
    <div className="min-h-screen bg-space-900">
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

        {allTags.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-6">
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

        {filteredNotes.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <NotebookPen className="w-16 h-16 text-metal-500 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-metal-300 text-lg mb-2">暂无笔记</p>
            <p className="text-metal-500 text-sm">点击"新建笔记"开始记录</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note: Note) => (
              <div key={note.id} className="glass-card glass-card-hover rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="w-4 h-4 text-aurora-400" />
                    <span className="text-metal-100 font-medium">{note.propertyTitle}</span>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 rounded-lg text-metal-400 hover:text-coral-500 hover:bg-coral-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-metal-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {note.content}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-metal-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(note.createdAt)}
                  </div>
                  {note.screenshot ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-aurora-500/20">
                      <img src={note.screenshot} alt="截图" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-space-800/50 border border-dashed border-metal-500/30 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-metal-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient font-display">新建笔记</h2>
              <button
                onClick={() => setShowForm(false)}
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
                  placeholder="记录你的看房感受..."
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
                <label className="block text-metal-300 text-sm font-medium mb-2">截图预览</label>
                <div className="h-32 rounded-xl bg-space-800/50 border border-dashed border-metal-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-metal-500 mx-auto mb-2" />
                    <span className="text-metal-500 text-xs">暂无截图</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
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
