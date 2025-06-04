import type { MantineSize, TextProps } from '@mantine/core';
import { Group, Loader, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useBuzz } from '~/components/Buzz/useBuzz';
import { CurrencyConfig } from '~/server/common/constants';
import type { BuzzAccountType } from '~/server/schema/buzz.schema';
import { abbreviateNumber } from '~/utils/number-helpers';

type Props = TextProps & {
  iconSize?: number;
  textSize?: MantineSize;
  withTooltip?: boolean;
  withAbbreviation?: boolean;
  accountId?: number;
  accountType?: BuzzAccountType | null;
  theme?: string;
};

export function UserBuzz({
  iconSize = 20,
  textSize = 'md',
  withTooltip,
  withAbbreviation = true,
  accountId,
  accountType,
  ...textProps
}: Props) {
  const { balance, balanceLoading } = useBuzz(accountId, accountType);
  const config = CurrencyConfig.BUZZ.themes?.[accountType ?? ''] ?? CurrencyConfig.BUZZ;
  const Icon = config.icon;
  const theme = useMantineTheme();

  const content = balanceLoading ? (
    <Group gap={4} wrap="nowrap">
      <Icon size={iconSize} color={config.color(theme)} fill={config.color(theme)} />
      <Loader color={config.color(theme)} type="dots" size="xs" />
    </Group>
  ) : (
    <Text component="div" c={config.color(theme)} tt="uppercase" {...textProps}>
      <Group gap={4} wrap="nowrap">
        <Icon size={iconSize} color="currentColor" fill="currentColor" />
        <Text size={textSize} fw={600} lh={0} style={{ fontVariantNumeric: 'tabular-nums' }} span>
          {balance === null ? (
            <Loader size="sm" type="dots" color={config.color(theme)} />
          ) : withAbbreviation ? (
            abbreviateNumber(balance, { floor: true })
          ) : (
            balance.toLocaleString()
          )}
        </Text>
      </Group>
    </Text>
  );

  return withTooltip ? (
    <Tooltip
      label={`Total balance: ${balance === null ? '(Loading...)' : balance.toLocaleString()}`}
    >
      {content}
    </Tooltip>
  ) : (
    content
  );
}
