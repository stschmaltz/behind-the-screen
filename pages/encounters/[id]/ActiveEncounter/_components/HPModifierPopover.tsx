import React, { useEffect, useRef } from 'react';
import { FloatingContext } from '@floating-ui/react';

export const HPModifierPopover = React.forwardRef<
  HTMLDivElement,
  {
    modifierType: 'damage' | 'heal' | 'temp';
    setModifierType: (type: 'damage' | 'heal' | 'temp') => void;
    modifierValue: string;
    setModifierValue: (value: string) => void;
    onApply: () => void;
    onClose: () => void;
    style: React.CSSProperties;
    context: FloatingContext;
  } & Omit<React.HTMLProps<HTMLDivElement>, 'context' | 'style'>
>(
  (
    {
      modifierType,
      setModifierType,
      modifierValue,
      setModifierValue,
      onApply,
      onClose,
      style,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const modifierValueRef = useRef(modifierValue);
    modifierValueRef.current = modifierValue;
    const setModifierValueRef = useRef(setModifierValue);
    setModifierValueRef.current = setModifierValue;

    const popoverClasses =
      'z-50 p-3 card bg-base-200 shadow-xl w-56 overflow-hidden !transition-none';

    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const handleWheel = (e: WheelEvent) => {
        if (document.activeElement !== input) return;
        e.preventDefault();
        e.stopPropagation();

        const currentValue = parseInt(modifierValueRef.current, 10) || 0;
        const newValue =
          e.deltaY < 0 ? currentValue + 1 : Math.max(1, currentValue - 1);
        setModifierValueRef.current(String(newValue));
      };

      input.addEventListener('wheel', handleWheel, { passive: false });

      return () => input.removeEventListener('wheel', handleWheel);
    }, []);

    const handleClose = onClose;
    const handleApply = onApply;

    return (
      <div
        ref={ref}
        className={popoverClasses}
        style={style}
        {...rest}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-sm font-semibold mb-2 capitalize">
          {modifierType} HP
        </h4>
        <div className="btn-group btn-group-xs grid grid-cols-3 mb-2">
          <button
            className={`btn btn-outline ${modifierType === 'damage' ? 'btn-active btn-error' : ''}`}
            onClick={() => setModifierType('damage')}
          >
            Dmg
          </button>
          <button
            className={`btn btn-outline ${modifierType === 'heal' ? 'btn-active btn-success' : ''}`}
            onClick={() => setModifierType('heal')}
          >
            Heal
          </button>
          <button
            className={`btn btn-outline ${modifierType === 'temp' ? 'btn-active btn-info' : ''}`}
            onClick={() => setModifierType('temp')}
          >
            Temp
          </button>
        </div>
        <input
          type="number"
          value={modifierValue}
          onChange={(e) => setModifierValue(e.target.value)}
          className="input input-bordered input-sm w-full"
          placeholder="Amount"
          min="1"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          ref={inputRef}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn btn-xs btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-xs btn-primary"
            onClick={handleApply}
            disabled={!modifierValue || Number(modifierValue) <= 0}
          >
            Apply
          </button>
        </div>
      </div>
    );
  },
);

HPModifierPopover.displayName = 'HPModifierPopover';

export default HPModifierPopover;
