import { useHasClientHistory } from '~/store/ClientHistoryStore';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { UrlObject } from 'url';
import { ActionIcon, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { LegacyActionIcon } from '~/components/LegacyActionIcon/LegacyActionIcon';

export function NavigateBack({
  url,
  as,
  options = {},
  children,
}: {
  url: UrlObject | string;
  as?: UrlObject | string;
  options?: { replace?: boolean; shallow?: boolean };
  children: ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => React.ReactElement;
}) {
  const router = useRouter();
  const closingRef = useRef(false);
  const hasHistory = useHasClientHistory();

  useEffect(() => {
    closingRef.current = false;
  }, [router]);

  const handleClick = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (hasHistory) history.go(-1);
    else {
      const navigate = options.replace ? router.replace : router.push;

      navigate(url, as, options);
    }
  };

  return children({ onClick: handleClick });
}

export function BackButton({
  url,
  as,
  options = {},
  children,
}: {
  url: UrlObject | string;
  as?: UrlObject | string;
  options?: { replace?: boolean; shallow?: boolean };
  children?: React.ReactNode;
}) {
  return (
    <NavigateBack url={url} as={as} options={options}>
      {({ onClick }) => (
        <Group gap="xs" onClick={onClick}>
          <LegacyActionIcon color="gray" variant="subtle">
            <IconArrowLeft />
          </LegacyActionIcon>
          {children}
        </Group>
      )}
    </NavigateBack>
  );
}
