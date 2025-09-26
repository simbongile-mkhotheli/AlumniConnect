import React, { useState, useRef, useCallback } from 'react';

export interface TagInputProps {
  id: string;
  label?: string; // if used standalone
  values: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  addKeys?: string[]; // default: Enter, Comma
}

const DEFAULT_ADD_KEYS = ['Enter', 'Tab', ','];

export const TagInput: React.FC<TagInputProps> = ({
  id,
  values,
  onChange,
  placeholder = 'Add and press Enter',
  maxTags,
  allowDuplicates = false,
  disabled = false,
  ariaLabel,
  addKeys = DEFAULT_ADD_KEYS,
}) => {
  const [input, setInput] = useState('');
  const [dupFlash, setDupFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalized = (s: string) => s.trim();
  const isDuplicate = useCallback((val: string) => {
    return values.some(v => v.toLowerCase() === val.toLowerCase());
  }, [values]);

  const addTag = useCallback((raw: string) => {
    const trimmed = normalized(raw);
    if (!trimmed) return;
    if (maxTags && values.length >= maxTags) return;
    if (!allowDuplicates && isDuplicate(trimmed)) {
      setDupFlash(true);
      setTimeout(() => setDupFlash(false), 400);
      return;
    }
    onChange([...values, trimmed]);
    setInput('');
  }, [values, maxTags, allowDuplicates, isDuplicate, onChange]);

  const removeTag = (idx: number) => {
    const next = values.filter((_, i) => i !== idx);
    onChange(next);
    setTimeout(() => { inputRef.current?.focus(); }, 0);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (addKeys.includes(e.key)) {
      if (e.key !== 'Tab') e.preventDefault();
      addTag(input);
      return;
    }
    if (e.key === 'Backspace' && input === '' && values.length > 0) {
      // remove last tag
      removeTag(values.length - 1);
    }
  };

  const handleBlur = () => {
    addTag(input); // commit on blur
  };

  return (
    <div className={`tag-input-container ${disabled ? 'disabled' : ''} ${dupFlash ? 'dup-flash' : ''}`.trim()}>
      <div className="tag-list" role="list" aria-label={ariaLabel || 'tags'}>
        {values.map((tag, i) => (
          <div key={tag + i} className="ac-tag" role="listitem" data-tag={tag}>
            <span className="ac-tag-text">{tag}</span>
            <button
              type="button"
              className="ac-tag-remove"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(i)}
              disabled={disabled}
            >
              ×
            </button>
          </div>
        ))}
        <input
          id={id}
          ref={inputRef}
          className="tag-input-field"
          value={input}
          disabled={disabled}
          placeholder={values.length === 0 ? placeholder : ''}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={handleBlur}
          aria-label={ariaLabel || 'Add tag'}
        />
      </div>
      {maxTags && <div className="tag-meta" aria-live="polite">{values.length}/{maxTags}</div>}
      {dupFlash && <div className="tag-feedback" role="status">Duplicate tag ignored</div>}
    </div>
  );
};

export default TagInput;
