import { Grid, Card, Text, Anchor, Stack, Group } from '@mantine/core';
import type { IconProps } from '@tabler/icons-react';
import { IconMail, IconQuestionMark, IconWand } from '@tabler/icons-react';
import { IconBook, IconBrandDiscord } from '@tabler/icons-react';
import { AssistantChat } from '~/components/Assistant/AssistantChat';

const SUPPORT_OPTIONS = [
  {
    title: 'Education Hub',
    description: 'Explore our Civitai and Generative AI tutorials & guides!',
    icon: (props: IconProps) => <IconBook {...props} />,
    link: { label: 'Visit the Education Hub', href: '/education' },
  },
  {
    title: 'Discord Community',
    description: 'Get assistance from our knowledgeable Community!',
    icon: (props: IconProps) => <IconBrandDiscord {...props} />,
    link: { label: 'Join our Discord Community', href: '/discord' },
  },
  {
    title: 'Frenquently Asked Questions',
    description: 'Check out the FAQ and Known Issues list',
    icon: (props: IconProps) => <IconQuestionMark {...props} />,
    link: {
      label: 'Civitai FAQ and Known Issues',
      href: 'https://education.civitai.com/civitai-faq',
    },
  },
  {
    title: 'Report a Bug',
    description: 'Questions, bugs or errors? Reach out!',
    icon: (props: IconProps) => <IconMail {...props} />,
    link: { label: 'Ticket portal', href: '/bugs' },
  },
  {
    title: 'Feature Requests',
    description: 'Civitai missing an essential feature? We’d love to hear!',
    icon: (props: IconProps) => <IconWand {...props} />,
    link: { label: 'Suggest a feature', href: '/feedback' },
  },
];

export function SupportContent() {
  return (
    <Grid gutter={24}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="lg">
          {SUPPORT_OPTIONS.map((option) => (
            <Card key={option.title} shadow="xs" radius={12} p="md" pr="lg">
              <Group align="flex-start" wrap="nowrap">
                <div style={{ minWidth: 32 }}>{option.icon({ size: 32 })}</div>
                <Stack gap="sm">
                  <Text size="sm" fw={500}>
                    {option.description}
                  </Text>
                  <Anchor
                    size="sm"
                    fw={700}
                    href={option.link.href}
                    target="_blank"
                    rel="nofollow noreferrer"
                  >
                    {option.link.label}
                  </Anchor>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <AssistantChat width="100%" height="100%" className="h-full min-h-[500px]" />
      </Grid.Col>
      <Grid.Col>
        <Text size="md">
          Still unsure? Contact us through our{' '}
          <Anchor href="/support-portal" td="underline">
            Support Portal
          </Anchor>
        </Text>
      </Grid.Col>
    </Grid>
  );
}
