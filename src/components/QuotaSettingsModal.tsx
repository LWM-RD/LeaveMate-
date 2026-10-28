import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { LeaveQuota, Language } from '../types/leave';
import { getTranslation } from '../utils/translations';

interface QuotaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: LeaveQuota;
  onSaveQuota: (newQuota: LeaveQuota) => void;
  lang: Language;
}

export const QuotaSettingsModal: React.FC<QuotaSettingsModalProps> = ({
  isOpen,
  onClose,
  quota,
  onSaveQuota,
  lang,
}) => {
  const t = getTranslation(lang);
  const [formData, setFormData] = useState<LeaveQuota>({ ...quota });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveQuota(formData);
    onClose();
  };

  const handleResetSriLankanStandard = () => {
    setFormData({
      year: quota.year,
      casual: 7,
      sick: 7,
      annual: 14,
      special: 5
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              {t.quotaTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {formData.year} {lang === 'si' ? 'වර්ෂයේ නිවාඩු හිමිකම්' : 'Leave Quotas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
            {lang === 'si'
              ? 'ශ්‍රී ලංකාවේ සාමාන්‍ය සේවා නීතියට අනුව වසරකට අනියම් (Casual) 7ක්, ලෙඩ (Sick/Medical) 7ක් සහ වාර්ෂික (Annual) 14ක් හිමිවේ. අවශ්‍ය නම් ඔබේ ආයතනයට අනුව වෙනස් කරගත හැක.'
              : 'Standard Sri Lankan employment practice provides 7 Casual, 7 Sick, and 14 Annual leave days. Adjust below to match your company policy.'}
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.annualLeave} ({lang === 'si' ? 'දින' : 'Days'})
              </label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                required
                value={formData.annual}
                onChange={(e) => setFormData({ ...formData, annual: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.casualLeave} ({lang === 'si' ? 'දින' : 'Days'})
              </label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                required
                value={formData.casual}
                onChange={(e) => setFormData({ ...formData, casual: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.sickLeave} ({lang === 'si' ? 'දින' : 'Days'})
              </label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                required
                value={formData.sick}
                onChange={(e) => setFormData({ ...formData, sick: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleResetSriLankanStandard}
              className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'සාමාන්‍ය සීමාවන්ට සකසන්න' : 'Reset to SL Standard'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.saveQuota}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
