import type { GroupProps } from '@mantine/core';
import { Group } from '@mantine/core';
import classes from '~/components/Filters/FeedFilters/FeedFilters.module.scss';
import { FollowedFilter } from '~/components/Filters/FollowedFilter';
import { MediaFiltersDropdown } from '~/components/Image/Filters/MediaFiltersDropdown';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { SortFilter } from '../SortFilter';
import { useImageQueryParams } from '~/components/Image/image.utils';
import { ImageSort } from '~/server/common/enums';
import { MetricTimeframe } from '~/shared/utils/prisma/enums';

export function ToolImageFeedFilters({ ...groupProps }: GroupProps) {
  const currentUser = useCurrentUser();

  const { replace, query } = useImageQueryParams();
  const {
    sort = ImageSort.MostReactions,
    period = MetricTimeframe.AllTime,
    baseModels,
    techniques,
    fromPlatform,
    hidden,
    followed,
    notPublished,
    scheduled,
    withMeta,
  } = query;

  return (
    <Group className={classes.filtersWrapper} gap={8} wrap="nowrap" {...groupProps}>
      {currentUser && (
        <FollowedFilter
          type="images"
          variant="button"
          value={`${followed}`}
          onChange={(value) => replace({ followed: value === 'true' })}
        />
      )}
      <SortFilter
        type="images"
        value={sort}
        onChange={(value) => replace({ sort: value as ImageSort })}
      />
      <MediaFiltersDropdown
        w="100%"
        filterType="images"
        query={{
          period,
          baseModels,
          techniques,
          fromPlatform,
          hidden,
          followed,
          notPublished,
          scheduled,
          withMeta,
        }}
        onChange={(filters) => replace(filters)}
        hideMediaTypes
        hideTools
        isFeed
        size="compact-sm"
      />
    </Group>
  );
}
