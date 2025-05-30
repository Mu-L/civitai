import { Menu } from '@mantine/core';
import { IconClubs } from '@tabler/icons-react';
import { trpc } from '~/utils/trpc';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import type { SupportedClubEntities } from '~/server/schema/club.schema';
import { AddResourceToClubModal } from './AddResourceToClubModal';
import { dialogStore } from '../Dialog/dialogStore';

export function AddToClubMenuItem({ entityType, entityId, resource }: Props) {
  const features = useFeatureFlags();
  const { data: userContributingClubs = [], isLoading } = trpc.club.userContributingClubs.useQuery(
    undefined,
    {
      enabled: features.clubs,
    }
  );

  const onClick = async () => {
    if (resource) {
      dialogStore.trigger({
        component: AddResourceToClubModal,
        props: {
          resource,
          entityType,
          entityId,
        },
      });
    } else {
      // openManageClubPostModal({ entityType, entityId });
    }
  };

  if (!features.clubs || isLoading || userContributingClubs?.length === 0) {
    return null;
  }

  return (
    <Menu.Item
      leftSection={<IconClubs size={14} stroke={1.5} />}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      key="add-to-club"
    >
      Add to club
    </Menu.Item>
  );
}

type Props = {
  entityType: SupportedClubEntities;
  entityId: number;
  // resource?: SearchIndexDataMap['models'][number] | SearchIndexDataMap['articles'][number];
  resource: any;
};
