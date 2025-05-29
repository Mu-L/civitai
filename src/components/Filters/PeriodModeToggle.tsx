import type { BoxProps } from '@mantine/core';
import { Box, Divider, SegmentedControl } from '@mantine/core';
import { useRouter } from 'next/router';
import { IsClient } from '~/components/IsClient/IsClient';
import type { PeriodModeType } from '~/providers/FiltersProvider';
import { useFiltersContext, useSetFilters } from '~/providers/FiltersProvider';
import type { PeriodMode } from '~/server/schema/base.schema';
import { removeEmpty } from '~/utils/object-helpers';

type Props = {
  type: PeriodModeType;
} & Omit<BoxProps, 'children'>;

const options = [
  { label: 'Stats', value: 'stats' as PeriodMode },
  { label: 'Published', value: 'published' as PeriodMode },
];

export function PeriodModeToggle({ type, ...props }: Props) {
  const { query, pathname, replace } = useRouter();
  const globalValue = useFiltersContext((state) => state[type].periodMode);
  const queryValue = query.periodMode as PeriodMode | undefined;
  const setFilters = useSetFilters(type);

  const value = queryValue ? queryValue : globalValue;
  const setValue = (value: string) => {
    if (queryValue && queryValue !== value)
      replace({ pathname, query: removeEmpty({ ...query, periodMode: undefined }) }, undefined, {
        shallow: true,
      });
    setFilters({ periodMode: value as PeriodMode });
  };

  return (
    <IsClient>
      <Box {...props}>
        <Divider label="Mode" labelPosition="center" />
        <SegmentedControl data={options} value={value} onChange={setValue} size="xs" />
      </Box>
    </IsClient>
  );
}
