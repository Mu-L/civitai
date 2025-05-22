import { Button, Menu } from '@mantine/core';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { useGetActionMenuItems } from '~/components/AppLayout/AppHeader/hooks';
import { CurrencyIcon } from '~/components/Currency/CurrencyIcon';
import { LoginRedirect } from '~/components/LoginRedirect/LoginRedirect';
import { NextLink } from '~/components/NextLink/NextLink';
import { GenerateButton } from '~/components/RunStrategy/GenerateButton';
import { useIsMobile } from '~/hooks/useIsMobile';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import { constants } from '~/server/common/constants';
import { Currency } from '~/shared/utils/prisma/enums';

export function CreateMenu() {
  const features = useFeatureFlags();
  const isMobile = useIsMobile({ breakpoint: 'md' });

  return (
    <Menu
      position="bottom"
      offset={5}
      trigger="hover"
      openDelay={400}
      zIndex={constants.imageGeneration.drawerZIndex + 2}
      disabled={isMobile}
      withinPortal
      withArrow
    >
      <Menu.Target>
        {features.imageGeneration ? (
          <div className="flex items-center">
            <GenerateButton
              canGenerate
              variant="light"
              py={8}
              pl={12}
              pr={4}
              h="auto"
              radius="sm"
              mode="toggle"
              // Quick hack to avoid svg from going over the button. cc: Justin 👀
              size="compact-sm"
              data-activity="create:navbar"
              className="h-auto !px-2 py-2 @md:rounded-r-none @md:pr-1"
            />
            <Button
              variant="light"
              py={8}
              px={4}
              h="auto"
              radius="sm"
              className="rounded-l-none @max-md:hidden"
            >
              <IconChevronDown stroke={2} size={20} />
            </Button>
          </div>
        ) : (
          <Button className="flex @max-md:hidden" variant="filled" color="green" size="xs" pl={5}>
            <IconPlus size={16} /> New
          </Button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <CreateMenuContent />
      </Menu.Dropdown>
    </Menu>
  );
}

function CreateMenuContent() {
  const items = useGetActionMenuItems();
  return (
    <>
      {items
        .filter(({ visible }) => visible !== false)
        .map((link, index) => {
          const menuItem = (
            <Menu.Item
              key={!link.redirectReason ? index : undefined}
              component={NextLink}
              href={link.href}
              as={link.as}
              rel={link.rel}
            >
              <div className="flex items-center gap-2.5">
                <link.icon stroke={1.5} color={link.color} />
                {link.label}
                {link.currency && <CurrencyIcon currency={Currency.BUZZ} size={16} />}
              </div>
            </Menu.Item>
          );

          return link.redirectReason ? (
            <LoginRedirect key={index} reason={link.redirectReason} returnUrl={link.href}>
              {menuItem}
            </LoginRedirect>
          ) : (
            menuItem
          );
        })}
    </>
  );
}
