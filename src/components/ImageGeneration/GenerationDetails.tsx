import type { AccordionControlProps } from '@mantine/core';
import { Accordion, Text } from '@mantine/core';
import type { Props as DescriptionTableProps } from '~/components/DescriptionTable/DescriptionTable';
import { DescriptionTable } from '~/components/DescriptionTable/DescriptionTable';
import { LineClamp } from '~/components/LineClamp/LineClamp';
import { getDisplayName, titleCase } from '~/utils/string-helpers';

export function GenerationDetails({
  params,
  label,
  controlProps,
  ...descriptionTableProps
}: Props) {
  const detailItems = Object.entries(params)
    .filter(([, value]) => {
      if (Array.isArray(value) || typeof value === 'object') return false;
      if (typeof value === 'string') return !!value.length;
      return value !== undefined;
    })
    .map(([key, value]) => ({
      label: titleCase(getDisplayName(key)),
      value: <LineClamp lineClamp={2}>{`${value}`}</LineClamp>,
    }));

  return (
    <Accordion
      variant="filled"
      styles={(theme) => ({
        content: {
          padding: 0,
        },
        item: {
          overflow: 'hidden',
          background: 'transparent',
        },
        control: {
          padding: 6,
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
        },
      })}
    >
      <Accordion.Item value="details">
        <Accordion.Control {...controlProps}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <DescriptionTable {...descriptionTableProps} items={detailItems} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

type Props = Omit<DescriptionTableProps, 'items'> & {
  label: string;
  params: Record<string, unknown>;
  controlProps?: AccordionControlProps;
};
