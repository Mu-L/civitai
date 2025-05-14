import {
  Button,
  Chip,
  ChipProps,
  Divider,
  Drawer,
  Group,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { IconChevronDown, IconFilter } from '@tabler/icons-react';
import { uniq } from 'lodash-es';
import React, { useState } from 'react';
import type { ImageSelectFilter } from '~/components/ImageGeneration/GenerationForm/resource-select.types';
import { useFilterStyles } from '~/components/ImageGeneration/GenerationForm/ResourceSelectFilters';
import { trainingStatusFields } from '~/components/User/UserTrainingModels';
import useIsClient from '~/hooks/useIsClient';
import { useIsMobile } from '~/hooks/useIsMobile';
import { BaseModel, constants } from '~/server/common/constants';
import type { TrainingDetailsObj } from '~/server/schema/model-version.schema';
import { TrainingStatus } from '~/shared/utils/prisma/enums';
import { titleCase } from '~/utils/string-helpers';
import { trainingModelInfo } from '~/utils/training';
import { isDefined } from '~/utils/type-guards';
import styles from './ImageSelectFilters.module.scss';

export function ImageSelectFiltersTrainingDropdown({
  selectFilters,
  setSelectFilters,
}: {
  selectFilters: ImageSelectFilter;
  setSelectFilters: React.Dispatch<React.SetStateAction<ImageSelectFilter>>;
}) {
  const { classes, theme, cx } = useFilterStyles();
  const mobile = useIsMobile();
  const isClient = useIsClient();

  const [opened, setOpened] = useState(false);

  const baseModelsList = uniq(Object.values(trainingModelInfo).map((v) => v.baseModel));

  // TODO add image/video?
  const filterLength =
    (selectFilters.hasLabels === true ? 1 : 0) +
    (isDefined(selectFilters.labelType) ? 1 : 0) +
    ((selectFilters.statuses?.length ?? 0) > 0 ? 1 : 0) +
    ((selectFilters.types?.length ?? 0) > 0 ? 1 : 0) +
    ((selectFilters.mediaTypes?.length ?? 0) > 0 ? 1 : 0) +
    ((selectFilters.baseModels?.length ?? 0) > 0 ? 1 : 0);

  const clearFilters = () => {
    const reset: Required<ImageSelectFilter> = {
      hasLabels: null,
      labelType: null,
      statuses: [],
      types: [],
      mediaTypes: [],
      baseModels: [],
    };
    setSelectFilters(reset);
  };

  const chipProps: Partial<ChipProps> = {
    size: 'sm',
    radius: 'xl',
    variant: 'filled',
    classNames: classes,
    tt: 'capitalize',
  };

  const target = (
    <Indicator
      offset={4}
      label={isClient && filterLength ? filterLength : undefined}
      size={16}
      zIndex={10}
      classNames={{ root: classes.indicatorRoot, indicator: classes.indicatorIndicator }}
      inline
    >
      <Button
        color="gray"
        radius="xl"
        variant={theme.colorScheme === 'dark' ? 'filled' : 'light'}
        rightIcon={<IconChevronDown className={cx({ [classes.opened]: opened })} size={16} />}
        onClick={() => setOpened((o) => !o)}
        data-expanded={opened}
        size="compact-md"
      >
        <Group gap={4} wrap="nowrap">
          <IconFilter size={16} />
          Filters
        </Group>
      </Button>
    </Indicator>
  );

  const dropdown = (
    <Stack gap="lg" p="md">
      <Stack gap="md">
        <Divider label="Labels" classNames={{ label: 'font-bold text-sm' }} />
        <Chip
          {...chipProps}
          checked={selectFilters.hasLabels === true}
          onChange={(checked) => setSelectFilters((f) => ({ ...f, hasLabels: checked }))}
          my={4}
        >
          <span>Has Labels</span>
        </Chip>

        <Divider label="Label Type" classNames={{ label: 'font-bold text-sm' }} />
        <Group gap={8} my={4}>
          {constants.autoLabel.labelTypes.map((lt) => (
            <Chip
              {...chipProps}
              key={lt}
              checked={selectFilters.labelType === lt}
              onChange={(checked) =>
                setSelectFilters((f) => ({ ...f, labelType: checked ? lt : null }))
              }
            >
              <span>{lt}</span>
            </Chip>
          ))}
        </Group>

        <Divider label="Training Status" classNames={{ label: 'font-bold text-sm' }} />
        <Chip.Group
          value={selectFilters.statuses}
          onChange={(sts) => setSelectFilters((f) => ({ ...f, statuses: sts as TrainingStatus[] }))}
          multiple
        >
          <Group gap={8} my={4}>
            {Object.values(TrainingStatus).map((ts) => (
              <Chip
                key={ts}
                value={ts}
                {...chipProps}
                color={trainingStatusFields[ts]?.color ?? 'gray'}
              >
                <span>{ts === 'InReview' ? 'Ready' : ts}</span>
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <Divider label="Media Type" classNames={{ label: 'font-bold text-sm' }} />
        <Chip.Group
          value={selectFilters.mediaTypes}
          onChange={(ts) =>
            setSelectFilters((f) => ({ ...f, mediaTypes: ts as TrainingDetailsObj['mediaType'][] }))
          }
          multiple
        >
          <Group gap={8} my={4}>
            {constants.trainingMediaTypes.map((ty) => (
              <Chip key={ty} value={ty} {...chipProps}>
                <span>{titleCase(ty)}</span>
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <Divider label="Type" classNames={{ label: 'font-bold text-sm' }} />
        <Chip.Group
          value={selectFilters.types}
          onChange={(ts) =>
            setSelectFilters((f) => ({ ...f, types: ts as TrainingDetailsObj['type'][] }))
          }
          multiple
        >
          <Group gap={8} my={4}>
            {constants.trainingModelTypes.map((ty) => (
              <Chip key={ty} value={ty} {...chipProps}>
                <span>{ty}</span>
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <Divider label="Base model" classNames={{ label: 'font-bold text-sm' }} />
        <Chip.Group
          value={selectFilters.baseModels}
          onChange={(bms) => setSelectFilters((f) => ({ ...f, baseModels: bms as BaseModel[] }))}
          multiple
        >
          <Group gap={8} my={4}>
            {baseModelsList.map((baseModel, index) => (
              <Chip key={index} value={baseModel} {...chipProps}>
                <span>{baseModel}</span>
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>

      {filterLength > 0 && (
        <Button
          color="gray"
          variant={theme.colorScheme === 'dark' ? 'filled' : 'light'}
          onClick={clearFilters}
          fullWidth
        >
          Clear all filters
        </Button>
      )}
    </Stack>
  );

  if (mobile)
    return (
      <>
        {target}
        <Drawer
          opened={opened}
          onClose={() => setOpened(false)}
          size="90%"
          position="bottom"
          classNames={{
            root: styles.root,
            content: styles.content,
            body: styles.body,
            header: styles.header,
            close: styles.close,
          }}
        >
          {dropdown}
        </Drawer>
      </>
    );

  return (
    <Popover
      zIndex={200}
      position="bottom-end"
      shadow="md"
      radius={12}
      onClose={() => setOpened(false)}
      middlewares={{ flip: true, shift: true }}
      // withinPortal
    >
      <Popover.Target>{target}</Popover.Target>
      <Popover.Dropdown maw={468} p={0} w="100%">
        <ScrollArea.Autosize type="hover" mah={'calc(90vh - var(--header-height) - 56px)'}>
          {dropdown}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}
