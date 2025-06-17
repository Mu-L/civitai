import { Button, Container, Group, Image, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { NextLink as Link } from '~/components/NextLink/NextLink';
import { IconCloudPlus, IconDownload, IconMapSearch, IconRadar2 } from '@tabler/icons-react';
import { Meta } from '~/components/Meta/Meta';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useIsMobile } from '~/hooks/useIsMobile';

export default function CivitaiVault() {
  const currentUser = useCurrentUser();
  const isMember = currentUser?.isMember;
  const buttonData = {
    text: isMember ? 'Go to my Vault' : 'Become a Supporter',
    href: isMember ? '/user/vault' : '/pricing',
  };
  const isMobile = useIsMobile();

  return (
    <>
      <Meta
        title="Civitai Vault | Store your favorite models forever"
        description="Civitai Vault is a place to store your favorite models forever. Even if a model is removed from the site, you can still access it here."
      />
      <Container size="md" mb="lg">
        <Stack gap={40}>
          <Group justify="space-between">
            <Stack gap={12}>
              <Title className="text-3xl font-bold text-gray-9 @md:text-4xl dark:text-white">
                Civitai Vault
              </Title>
              {isMember ? (
                <Text className="text-sm font-medium" style={{ lineHeight: 1.25 }}>
                  Keep Your Favorite Models Forever
                </Text>
              ) : (
                <Text className="text-sm font-medium" style={{ lineHeight: 1.25 }}>
                  ❤️ Civitai Vault is only available to Supporters
                </Text>
              )}
            </Stack>
            <Button
              variant="filled"
              color="blue"
              size="lg"
              radius="xl"
              component={Link}
              href={buttonData.href}
              rel="nofollow noreferrer"
              fullWidth={isMobile}
            >
              {buttonData.text}
            </Button>
          </Group>
          <div className="relative mb-6">
            <Image
              src="/images/product/vault/lp-main.png"
              alt="check out the vault"
              w="100%"
              h="auto"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(26, 27, 30, 0.00) 50%, #1A1B1E 100%)',
              }}
            />
          </div>
          <Stack gap={12}>
            <Title className="text-3xl font-bold text-gray-9 dark:text-white" order={3}>
              Keep Your Favorite Models Forever
            </Title>
            <Text>
              {`Civitai Vault is your secure, cloud-based storage solution for your most cherished AI models. Even if a creator removes a model, it remains safely stored in your personal vault. Free up valuable disk space and have peace of mind knowing your models are always accessible.`}
            </Text>
          </Stack>
          <Stack gap={60}>
            <Group wrap="nowrap">
              <ThemeIcon size={72} variant="light" color="green" radius={1000}>
                <IconCloudPlus size={40} />
              </ThemeIcon>

              <Stack gap={0}>
                <Title className="text-xl font-bold text-gray-9 dark:text-white" order={4}>
                  Effortlessly Save Models
                </Title>
                <Text>
                  Seamlessly save any model to your vault. Your storage capacity is determined by
                  your Supporter tier, ensuring you have ample space for your collection.
                </Text>
              </Stack>
            </Group>
            <Group wrap="nowrap">
              <ThemeIcon size={72} variant="light" color="blue" radius={1000}>
                <IconMapSearch size={40} />
              </ThemeIcon>

              <Stack gap={0}>
                <Title className="text-xl font-bold text-gray-9 dark:text-white" order={4}>
                  Intuitive Organization Tools
                </Title>
                <Text>
                  Managing a vast library of models is a breeze with our powerful search
                  functionality, customizable filters, and the ability to add personal notes.
                  Quickly find the perfect model for your needs.
                </Text>
              </Stack>
            </Group>
            <Group wrap="nowrap">
              <ThemeIcon size={72} variant="light" color="green" radius={1000}>
                <IconDownload size={40} />
              </ThemeIcon>

              <Stack gap={0}>
                <Title className="text-xl font-bold text-gray-9 dark:text-white" order={4}>
                  Download on Demand
                </Title>
                <Text>
                  Access and download your stored models whenever you require them, from any device,
                  at any time. Your creativity knows no bounds with Civitai Vault.
                </Text>
              </Stack>
            </Group>
            <Group wrap="nowrap">
              <ThemeIcon size={72} variant="light" color="blue" radius={1000}>
                <IconRadar2 size={40} />
              </ThemeIcon>

              <Stack gap={0}>
                <Title className="text-xl font-bold text-gray-9 dark:text-white" order={4}>
                  Automatic Updates{' '}
                  <Text c="dimmed" component="span" size="xs">
                    Coming Soon
                  </Text>
                </Title>
                <Text>
                  Stay up-to-date with the latest versions of your favorite models. Civitai Vault
                  automatically checks for updates and notifies you when new versions are available,
                  ensuring you always have access to the most advanced iterations.
                </Text>
              </Stack>
            </Group>
            {isMember ? (
              <Text ta="center" size="lg" fs="italic">
                Upgrade your membership to expand your Civitai Vault storage capacity and unlock
                additional features.
              </Text>
            ) : (
              <Text ta="center" size="lg" fs="italic">
                Civitai Vault is only available to Supporters. Become a Supporter to access Civitai
                Vault and enjoy a host of other benefits.
              </Text>
            )}
          </Stack>
          <Button
            variant="filled"
            color="blue"
            size="lg"
            radius="xl"
            component={Link}
            href={buttonData.href}
            rel="nofollow noreferrer"
            fullWidth
          >
            {buttonData.text}
          </Button>
          <Stack gap={0}>
            <Text
              size="xs"
              c="dimmed"
            >{`*Upon cancellation of your membership, you will have 7 days to download things from your Vault after which they will remain in your Vault for 23 more days, but you will be unable to download them.`}</Text>
            <Text
              size="xs"
              c="dimmed"
            >{`**Models that are removed from the site for Terms of Service violations will also be removed from your Vault.`}</Text>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
