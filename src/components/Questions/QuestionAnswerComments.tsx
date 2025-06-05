import { Box, Group, Text, Center, Loader } from '@mantine/core';
import { Comment } from '~/components/CommentsV2/Comment/Comment';
import { RootThreadProvider } from '~/components/CommentsV2/CommentsProvider';
import { CreateComment } from '~/components/CommentsV2/Comment/CreateComment';
import type { CommentConnectorInput } from '~/server/schema/commentv2.schema';
import classes from './QuestionAnswerComments.module.scss';

type Props = CommentConnectorInput & {
  initialCount?: number;
  limit?: number;
  userId: number;
};
export function QuestionAnswerComments({
  limit,
  userId,
  entityId,
  entityType,
  initialCount,
}: Props) {
  return (
    <RootThreadProvider
      limit={limit}
      initialCount={initialCount}
      badges={[{ label: 'op', color: 'violet', userId }]}
      entityId={entityId}
      entityType={entityType}
    >
      {({ data, created, isLoading, remaining, showMore, toggleShowMore }) =>
        isLoading ? (
          <Center>
            <Loader type="bars" />
          </Center>
        ) : (
          <Box className={classes.list}>
            {data?.map((comment) => (
              <Comment key={comment.id} comment={comment} className={classes.listItem} />
            ))}

            {!!remaining && !showMore && (
              <Group gap="xs" align="center" p="sm" pb={0}>
                <Text c="blue.4" style={{ cursor: 'pointer' }} onClick={toggleShowMore}>
                  Show {remaining} More
                </Text>
              </Group>
            )}
            {created.map((comment) => (
              <Comment key={comment.id} comment={comment} className={classes.listItem} />
            ))}
            {!remaining && (
              <Box p="sm" pb={0}>
                <CreateComment />
              </Box>
            )}
          </Box>
        )
      }
    </RootThreadProvider>
  );
}
