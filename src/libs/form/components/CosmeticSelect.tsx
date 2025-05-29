import type { InputWrapperProps, SimpleGridProps } from '@mantine/core';
import {
  Center,
  Indicator,
  Input,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconBuildingStore } from '@tabler/icons-react';
import type { SimpleCosmetic, WithClaimKey } from '~/server/selectors/cosmetic.selector';
import { NextLink as Link } from '~/components/NextLink/NextLink';
import { CosmeticSample } from '~/components/Shop/CosmeticSample';
import classes from './CosmeticSelect.module.scss';
import clsx from 'clsx';

export function CosmeticSelect<TData extends CosmeticItem>({
  data,
  value = null,
  onChange,
  gridProps,
  nothingFound,
  shopUrl,
  onShopClick,
  ...props
}: Props<TData>) {
  const handleClick = (value: TData | null) => {
    onChange?.(value);
  };

  const hasItems = data.length > 0;

  return (
    <Input.Wrapper {...props}>
      <SimpleGrid
        spacing="xs"
        cols={{
          base: 2,
          xs: 3,
          sm: 4,
          md: 5,
        }}
        {...gridProps}
      >
        {shopUrl && (
          <Link href={shopUrl}>
            <UnstyledButton p="sm" className={classes.decoration} onClick={onShopClick}>
              <Stack gap={4} align="center" justify="center">
                <IconBuildingStore size={24} />
                <Text size="sm" fw={500}>
                  Shop
                </Text>
              </Stack>
            </UnstyledButton>
          </Link>
        )}
        {hasItems ? (
          data.map((item) => {
            const isSelected = value && value.id === item.id && value.claimKey === item.claimKey;

            return (
              <Indicator
                key={`${item.id}:${item.claimKey}`}
                label="In use"
                position="top-center"
                disabled={!item.inUse}
                color="gray.1"
                styles={{
                  indicator: { color: '#222', height: 'auto !important', fontWeight: 500 },
                }}
                inline
              >
                <UnstyledButton
                  className={clsx(classes.decoration, isSelected && classes.selected)}
                  p="sm"
                  onClick={() => handleClick(!isSelected ? item : null)}
                >
                  <CosmeticSample cosmetic={item} />
                </UnstyledButton>
              </Indicator>
            );
          })
        ) : (
          <Paper
            className={clsx(classes.noContent, {
              [classes.noContentNoUrl]: !shopUrl,
            })}
            p="sm"
            radius="md"
          >
            <Stack h="100%" justify="center">
              <Center>{nothingFound ? nothingFound : <Text size="xs">No decorations</Text>}</Center>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>
    </Input.Wrapper>
  );
}

type CosmeticItem = WithClaimKey<
  Pick<
    SimpleCosmetic,
    'id' | 'type' | 'name' | 'equippedToId' | 'equippedToType' | 'inUse' | 'obtainedAt'
  >
> & { data: MixedObject };
type Props<TData extends CosmeticItem> = Omit<InputWrapperProps, 'onChange' | 'children'> & {
  data: TData[];
  shopUrl?: string;
  onChange?: (value: TData | null) => void;
  value?: TData | null;
  nothingFound?: React.ReactNode;
  gridProps?: SimpleGridProps;
  onShopClick?: () => void;
};
