import { useState } from 'react';
import { issueCategories, getLabel } from '../data/issues';
import { t } from '../data/translations';

export default function IssueSelector({ lang, onSelect }) {
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [otherCategory, setOtherCategory] = useState('');
  const [otherSub, setOtherSub] = useState('');

  function handleCategory(cat) {
    setCategory(cat);
    setSubcategory(null);
    onSelect({ category: cat, subcategory: null });
  }

  function handleSub(sub) {
    setSubcategory(sub);
    onSelect({ category, subcategory: sub });
  }

  return (
    <div className="space-y-4">
      {/* Category */}
      <div>
        <p className="text-white/70 text-sm uppercase tracking-wide mb-2">{t(lang, 'issueType')}</p>
        <div className="grid grid-cols-2 gap-2">
          {issueCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat)}
              className={`p-3 rounded-xl text-sm font-semibold text-left transition-all ${
                category?.id === cat.id
                  ? 'bg-white text-coral'
                  : 'bg-white/20 text-white'
              }`}
            >
              {getLabel(cat.label, lang)}
            </button>
          ))}
        </div>
        {category?.id === 'other' && (
          <input
            className="mt-2 w-full p-3 rounded-xl text-gray-800"
            placeholder={t(lang, 'describeIssue')}
            value={otherCategory}
            onChange={(e) => {
              setOtherCategory(e.target.value);
              onSelect({ category: { ...category, label: { en: e.target.value } }, subcategory: null });
            }}
          />
        )}
      </div>

      {/* Subcategory */}
      {category && category.id !== 'other' && category.subcategories.length > 0 && (
        <div>
          <p className="text-white/70 text-sm uppercase tracking-wide mb-2">{t(lang, 'moreSpecifically')}</p>
          <div className="flex flex-col gap-2">
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSub(sub)}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all ${
                  subcategory?.id === sub.id
                    ? 'bg-white text-coral'
                    : 'bg-white/20 text-white'
                }`}
              >
                {getLabel(sub.label, lang)}
              </button>
            ))}
            <button
              onClick={() => handleSub({ id: 'other', label: { en: '' } })}
              className={`p-3 rounded-xl text-sm font-semibold text-left transition-all ${
                subcategory?.id === 'other'
                  ? 'bg-white text-coral'
                  : 'bg-white/20 text-white'
              }`}
            >
              {t(lang, 'other')}
            </button>
          </div>
          {subcategory?.id === 'other' && (
            <input
              className="mt-2 w-full p-3 rounded-xl text-gray-800"
              placeholder={t(lang, 'describeMoreSpecifically')}
              value={otherSub}
              onChange={(e) => {
                setOtherSub(e.target.value);
                onSelect({ category, subcategory: { id: 'other', label: { en: e.target.value } } });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
