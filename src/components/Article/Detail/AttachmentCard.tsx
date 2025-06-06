import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBrandPython, IconFileText, IconMarkdown, IconTxt, IconZip } from '@tabler/icons-react';

import type { ArticleGetById } from '~/server/services/article.service';
import { formatKBytes } from '~/utils/number-helpers';

const fileCosmetics = {
  txt: {
    icon: <IconTxt />,
    color: 'violet',
  },
  pdf: {
    icon: <IconFileText />,
    color: 'red',
  },
  md: {
    icon: <IconMarkdown />,
    color: 'gray',
  },
  zip: {
    icon: <IconZip />,
    color: 'orange',
  },
  py: {
    icon: <IconBrandPython />,
    color: 'blue',
  },
} as const;

export function AttachmentCard({ id, name, sizeKB, url }: Props) {
  const extension = url.split('.').pop() as keyof typeof fileCosmetics;
  const { icon, color } = fileCosmetics[extension] ?? fileCosmetics.pdf;

  return (
    <Card
      className="hover:bg-gray-0/5 dark:hover:bg-dark-4/5"
      radius={0}
      py="xs"
      component="a"
      href={`/api/download/attachments/${id}`}
      download
    >
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon
          size="lg"
          variant="light"
          color={color}
          style={{ backgroundColor: 'transparent' }}
        >
          {icon}
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="sm" lineClamp={1}>
            {name}
          </Text>
          <Text c="dimmed" size="xs">
            {formatKBytes(sizeKB)}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}

type Props = Pick<ArticleGetById['attachments'][number], 'id' | 'name' | 'sizeKB' | 'url'>;
