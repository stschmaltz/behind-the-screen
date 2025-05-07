import React, { useState } from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { HPModifierPopover } from './HPModifierPopover';

export const CharacterHP: React.FC<{
  currentHP: number;
  maxHP?: number;
  modifierType: 'damage' | 'heal' | 'temp';
  setModifierType: (type: 'damage' | 'heal' | 'temp') => void;
  modifierValue: string;
  setModifierValue: (value: string) => void;
  onApplyModifier: () => void;
}> = ({
  currentHP,
  maxHP,
  modifierType,
  setModifierType,
  modifierValue,
  setModifierValue,
  onApplyModifier,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift({ padding: 5 })],
    placement: 'top',
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const healthPercentage =
    (maxHP ?? 0) > 0 ? (currentHP / (maxHP ?? 1)) * 100 : 0;

  const getProgressColor = () => {
    if (healthPercentage > 50) return 'progress-success';
    if (healthPercentage > 25) return 'progress-warning';

    return 'progress-error';
  };

  const HPDisplay = () => {
    if (maxHP) {
      return (
        <div className="flex flex-col items-end">
          <span
            className={`text-sm font-medium whitespace-nowrap mb-0.5 ${
              currentHP <= 0 ? 'text-neutral-content text-opacity-70' : ''
            }`}
          >
            HP: {currentHP}/{maxHP}
          </span>
          {currentHP > 0 && (
            <progress
              className={`progress ${getProgressColor()} w-20 h-2`}
              value={currentHP}
              max={maxHP}
              aria-label={`Health: ${currentHP} of ${maxHP}`}
            ></progress>
          )}
        </div>
      );
    }

    return (
      <div
        className={`px-2 py-1 rounded-full text-white text-sm font-medium whitespace-nowrap ${
          currentHP <= 0
            ? 'bg-neutral text-neutral-content text-opacity-70'
            : 'bg-info'
        }`}
      >
        HP: {currentHP}
      </div>
    );
  };

  const handleApply = () => {
    onApplyModifier();
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <HPDisplay />
        <button
          ref={refs.setReference}
          className="btn btn-xs btn-ghost"
          aria-label="Adjust HP"
          {...getReferenceProps()}
        >
          <span className="text-xs">+/-</span>
        </button>
      </div>

      <FloatingPortal>
        {isOpen && (
          <HPModifierPopover
            ref={refs.setFloating}
            style={floatingStyles}
            context={context}
            modifierType={modifierType}
            setModifierType={setModifierType}
            modifierValue={modifierValue}
            setModifierValue={setModifierValue}
            onApply={handleApply}
            onClose={() => setIsOpen(false)}
            {...getFloatingProps()}
          />
        )}
      </FloatingPortal>
    </>
  );
};

export default CharacterHP;
