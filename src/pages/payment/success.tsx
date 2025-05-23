import {
  Container,
  Stack,
  Title,
  Text,
  Alert,
  ThemeIcon,
  Group,
  Button,
  Center,
} from '@mantine/core';
import { NextLink as Link } from '~/components/NextLink/NextLink';
import { IconCircleCheck, IconLayoutDashboard, IconRosette } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { EdgeMedia } from '~/components/EdgeMedia/EdgeMedia';
import { Meta } from '~/components/Meta/Meta';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import animationClasses from '~/libs/animations.module.scss';

export default function PaymentSuccess() {
  const router = useRouter();
  const { cid } = router.query as { cid: string };
  const { customerId, refresh } = useCurrentUser() ?? {};

  // Only run once - otherwise we'll get an infinite loop
  useEffect(() => {
    refresh?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (cid !== customerId?.slice(-8)) {
    router.replace('/');
    return null;
  }

  return (
    <>
      <Meta title="Successful Payment | Civitai" deIndex />
      <Container size="xs" mb="lg">
        <Stack>
          <Alert radius="sm" color="green" className="z-10">
            <Group gap="xs" wrap="nowrap" justify="center">
              <ThemeIcon color="green" size="lg">
                <IconCircleCheck />
              </ThemeIcon>
              <Title order={2}>Payment Complete!</Title>
            </Group>
          </Alert>
          <Center className={animationClasses.jelloFall}>
            <EdgeMedia src="41585279-0f0a-4717-174c-b5f02e157f00" width={256} />
          </Center>
          <Title order={1} className="text-center">
            Thank you! 🎉
          </Title>
          <Text size="lg" align="center" mb="lg">
            {`Thank you so much for your support! Your perks may take a few moments* to come in to effect, but our love for you is instant.`}
          </Text>

          <Group grow>
            <Button component={Link} href="/models" size="md" leftSection={<IconLayoutDashboard />}>
              View Models
            </Button>
            <Button
              variant="light"
              component={Link}
              href="/user/account"
              size="md"
              rightSection={<IconRosette />}
            >
              Customize Profile
            </Button>
          </Group>
          <Text
            size="xs"
            c="dimmed"
          >{`*Cosmetics and other perks should be delivered within 2-3 minutes, but you may need to refresh the site before you're able to see them in your profile.`}</Text>
        </Stack>
      </Container>
    </>
  );
}
