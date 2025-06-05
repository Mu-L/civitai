import type { TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

export function LineClamp({
  children,
  lineClamp = 3,
  ...props
}: TextProps & { children: React.ReactNode; lineClamp?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [clamped, setClamped] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    setClamped(element.offsetHeight < element.scrollHeight);
  }, []);

  return (
    <>
      <Text ref={ref} component="div" lineClamp={!showMore ? lineClamp : undefined} {...props}>
        {children}
      </Text>
      {clamped && (
        <div className="flex justify-start">
          <Text
            c="blue.4"
            className="cursor-pointer text-sm"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show less' : 'Show more'}
          </Text>
        </div>
      )}
    </>
  );
}
