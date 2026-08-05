import { useState } from 'react';
import { issueCategories } from '../data/issues';

export default function IssueSelector({ onSelect }) {
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
        <p className="text-white/70 text-sm uppercase tracking-wide mb-2">Issue type</p>
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
              {cat.label}
            </button>
          ))}
        </div>
        {category?.id === 'other' && (
          <input
            className="mt-2 w-full p-3 rounded-xl text-gray-800"
            placeholder="Describe the issue..."
            value={otherCategory}
            onChange={(e) => {
              setOtherCategory(e.target.value);
              onSelect({ category: { ...category, label: e.target.value }, subcategory: null });
            }}
          />
        )}
      </div>

      {/* Subcategory */}
      {category && category.id !== 'other' && category.subcategories.length > 0 && (
        <div>
          <p className="text-white/70 text-sm uppercase tracking-wide mb-2">More specifically</p>
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
                {sub.label}
              </button>
            ))}
            <button
              onClick={() => handleSub({ id: 'other', label: '' })}
              className={`p-3 rounded-xl text-sm font-semibold text-left transition-all ${
                subcategory?.id === 'other'
                  ? 'bg-white text-coral'
                  : 'bg-white/20 text-white'
              }`}
            >
              Other
            </button>
          </div>
          {subcategory?.id === 'other' && (
            <input
              className="mt-2 w-full p-3 rounded-xl text-gray-800"
              placeholder="Describe more specifically..."
              value={otherSub}
              onChange={(e) => {
                setOtherSub(e.target.value);
                onSelect({ category, subcategory: { id: 'other', label: e.target.value } });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
