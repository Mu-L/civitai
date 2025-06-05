import {
  ActionIcon,
  Center,
  CheckIcon,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { isEqual } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { NoContent } from '~/components/NoContent/NoContent';
import { InViewLoader } from '~/components/InView/InViewLoader';
import {
  useClubContributorStatus,
  useMutateClub,
  useQueryClubMembership,
} from '~/components/Club/club.utils';
import type { GetInfiniteClubMembershipsSchema } from '~/server/schema/clubMembership.schema';
import { ClubMembershipSort } from '~/server/common/enums';
import { UserAvatar } from '~/components/UserAvatar/UserAvatar';
import { formatDate } from '~/utils/date-helpers';
import {
  IconCheck,
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { openConfirmModal } from '@mantine/modals';
import { CurrencyBadge } from '~/components/Currency/CurrencyBadge';
import { ClubAdminPermission, Currency } from '~/shared/utils/prisma/enums';
import { showSuccessNotification } from '~/utils/notifications';
import { LegacyActionIcon } from '~/components/LegacyActionIcon/LegacyActionIcon';

export function ClubMembershipInfinite({ clubId, showEof = true }: Props) {
  // TODO.clubs: Add some custom filters for members.
  const [filters, setFilters] = useState<
    Omit<GetInfiniteClubMembershipsSchema, 'limit' | 'cursor' | 'clubId'>
  >({
    sort: ClubMembershipSort.MostRecent,
  });

  const [debouncedFilters, cancel] = useDebouncedValue(filters, 500);

  const { memberships, isLoading, fetchNextPage, hasNextPage, isRefetching } =
    useQueryClubMembership(clubId, debouncedFilters);

  const { isModerator, isOwner, permissions } = useClubContributorStatus({ clubId });
  const canManageMemberships =
    isModerator || isOwner || permissions?.includes(ClubAdminPermission.ManageMemberships);

  const {
    removeAndRefundMember,
    removingAndRefundingMember,
    togglePauseBilling,
    togglingPauseBilling,
  } = useMutateClub();

  //#region [useEffect] cancel debounced filters
  useEffect(() => {
    if (isEqual(filters, debouncedFilters)) cancel();
  }, [cancel, debouncedFilters, filters]);

  const onTogglePauseBilling = async (membership: (typeof memberships)[number]) => {
    await togglePauseBilling({
      userId: membership.user.id,
      clubId,
    });

    showSuccessNotification({
      title: 'Billing paused',
      message: `${membership.user.username}'s billing has been ${
        membership.billingPausedAt ? 'resumed' : 'paused'
      }.`,
    });
  };

  const onRemoveAndRefundMember = async (membership: (typeof memberships)[number]) => {
    openConfirmModal({
      title: 'Remove and refund member',
      children: (
        <Stack>
          <Text size="sm">
            Are you sure you want to remove and refund this member? This action is destructive and
            cannot be reverted.
          </Text>
          <Text size="sm">
            <Text fw="bold" component="span">
              {membership.user.username}
            </Text>{' '}
            will be removed from this club and refunded the last payment of{' '}
            <Text fw="bold" component="span">
              <CurrencyBadge
                unitAmount={membership.unitAmount}
                currency={membership.currency ?? Currency.BUZZ}
              />
            </Text>
          </Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Remove & refund', cancel: 'Cancel' },
      confirmProps: { color: 'red', loading: removingAndRefundingMember },
      onConfirm: async () => {
        await removeAndRefundMember({
          userId: membership.user.id,
          clubId,
        });

        showSuccessNotification({
          title: 'Member removed',
          message: `${membership.user.username} has been removed from this club.`,
        });
      },
    });
  };

  //#endregion

  return (
    <>
      {isLoading ? (
        <Center p="xl">
          <Loader size="xl" />
        </Center>
      ) : !!memberships.length ? (
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={isRefetching ?? false} zIndex={9} />
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Tier</th>
                <th>Membership fee</th>
                <th>Member since</th>
                <th>Next billing</th>
                <th>Cancelled on</th>
                <th>Expires on</th>
                <th>Billing paused from </th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={membership.id}>
                  <td>
                    <UserAvatar user={membership.user} withUsername />
                  </td>
                  <td>{membership.clubTier.name}</td>
                  <td>
                    <CurrencyBadge
                      unitAmount={membership.unitAmount}
                      currency={membership.currency ?? Currency.BUZZ}
                      size="sm"
                    />
                  </td>
                  <td>{formatDate(membership.startedAt)}</td>
                  <td>
                    {membership.clubTier.oneTimeFee
                      ? 'Single Payment - Not Applicable'
                      : membership.cancelledAt || membership.unitAmount === 0
                      ? '-'
                      : formatDate(membership.nextBillingAt)}
                  </td>
                  <td>{membership.cancelledAt ? formatDate(membership.cancelledAt) : '-'}</td>
                  <td>
                    {membership.cancelledAt && membership.expiresAt
                      ? formatDate(membership.expiresAt)
                      : '-'}
                  </td>
                  <td>
                    {membership.billingPausedAt ? formatDate(membership.billingPausedAt) : '-'}
                  </td>
                  <td>
                    {canManageMemberships ? (
                      <Group wrap="nowrap">
                        {membership.unitAmount > 0 && (
                          <Tooltip
                            label={`${
                              membership.billingPausedAt ? 'Resume' : 'Pause'
                            } billing for this user`}
                          >
                            <LegacyActionIcon
                              size="sm"
                              color="red"
                              variant="transparent"
                              onClick={() => onTogglePauseBilling(membership)}
                              loading={togglingPauseBilling}
                            >
                              {membership.billingPausedAt ? (
                                <IconPlayerPlay />
                              ) : (
                                <IconPlayerPause />
                              )}
                            </LegacyActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip label="Remove and refund last payment">
                          <LegacyActionIcon
                            size="sm"
                            color="red"
                            variant="transparent"
                            onClick={() => onRemoveAndRefundMember(membership)}
                            loading={removingAndRefundingMember}
                          >
                            <IconTrash />
                          </LegacyActionIcon>
                        </Tooltip>
                      </Group>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            {hasNextPage && (
              <InViewLoader
                loadFn={fetchNextPage}
                loadCondition={!isRefetching}
                style={{ gridColumn: '1/-1' }}
              >
                <Center p="xl" style={{ height: 36 }} mt="md">
                  <Loader />
                </Center>
              </InViewLoader>
            )}
          </Table>
          {!hasNextPage && showEof && (
            <Stack mt="xl">
              <Divider
                size="sm"
                className="text-sm"
                label={
                  <Group gap={4}>
                    <IconClock size={16} stroke={1.5} />
                    No more members to show.
                  </Group>
                }
                labelPosition="center"
              />
              <Center>
                <Stack gap={0} align="center">
                  <Text
                    c="blue.4"
                    size="sm"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Back to the top
                  </Text>
                </Stack>
              </Center>
            </Stack>
          )}
        </div>
      ) : (
        <NoContent message="It looks like no members have joined your club yet. You will start seeing results here as members come in" />
      )}
    </>
  );
}

type Props = { clubId: number; showEof?: boolean };
