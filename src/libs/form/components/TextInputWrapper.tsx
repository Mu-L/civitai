import type { TextInputProps } from '@mantine/core';
import { CloseButton, Group, TextInput } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type { RefObject } from 'react';
import { forwardRef, useRef } from 'react';

type ClearableTextInputProps = TextInputProps & {
  clearable?: boolean;
  onClear?: () => void;
};

export const TextInputWrapper = forwardRef<HTMLInputElement, ClearableTextInputProps>(
  ({ clearable = true, rightSection, onClear, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef) as unknown;

    const closeButton = props.value && props.type !== 'hidden' && (
      <CloseButton
        variant="transparent"
        tabIndex={-1}
        onClick={() => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(inputRef.current, '');

          const ev2 = new Event('input', { bubbles: true });
          inputRef.current?.dispatchEvent(ev2);
          onClear?.();
        }}
      />
    );
    return (
      <TextInput
        ref={mergedRef as RefObject<HTMLInputElement>}
        {...props}
        rightSection={
          (clearable || rightSection) &&
          props.type !== 'hidden' && (
            <Group gap={4} wrap="nowrap">
              {clearable && !props.disabled && closeButton}
              {rightSection}
            </Group>
          )
        }
      />
    );
  }
);

TextInputWrapper.displayName = 'ClearableTextInput';
