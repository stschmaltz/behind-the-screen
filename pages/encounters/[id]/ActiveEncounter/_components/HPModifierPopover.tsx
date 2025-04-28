import React, { WheelEvent } from 'react';
import { FloatingContext } from '@floating-ui/react';
import { usePopoverContext } from '../../../../../context/PopoverContext';

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
    const { setIsScrollLockActive } = usePopoverContext();

    const popoverClasses =
      'z-50 p-3 card bg-base-200 shadow-xl w-56 overflow-hidden';

    const handleInputFocus = () => {
      setIsScrollLockActive(true);
    };

    const handleInputBlur = () => {
      setIsScrollLockActive(false);
    };

    const handleClose = () => {
      setIsScrollLockActive(false);
      onClose();
    };

    const handleApply = () => {
      setIsScrollLockActive(false);
      onApply();
    };

    const handleInputScroll = (e: WheelEvent<HTMLInputElement>) => {
      e.stopPropagation();

      const currentValue = parseInt(modifierValue, 10) || 0;
      let newValue = currentValue;

      if (e.deltaY < 0) {
        newValue = currentValue + 1;
      } else if (e.deltaY > 0) {
        newValue = Math.max(1, currentValue - 1);
      }

      setModifierValue(String(newValue));
    };

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
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onWheel={handleInputScroll}
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
