import {
  Accordion,
  ActionIcon,
  Badge,
  Divider,
  Group,
  Paper,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconFilter, IconPhoto, IconSearch, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import type { TrainingDetailsObj } from '~/server/schema/model-version.schema';
import type { ImageDataType } from '~/store/training.store';
import {
  defaultTrainingState,
  defaultTrainingStateVideo,
  getShortNameFromUrl,
  trainingStore,
  useTrainingImageStore,
} from '~/store/training.store';
import { useDebouncer } from '~/utils/debouncer';
import 'draft-js/dist/Draft.css';
import { blankTagStr } from '~/components/Training/Form/TrainingImagesTagViewer';
import styles from './TrainingImagesCaptionViewer.module.scss';
import { LegacyActionIcon } from '~/components/LegacyActionIcon/LegacyActionIcon';

export const TrainingImagesCaptions = ({
  imgData,
  modelId,
  mediaType,
  searchCaption,
}: {
  imgData: ImageDataType;
  modelId: number;
  mediaType: TrainingDetailsObj['mediaType'];
  searchCaption: string;
}) => {
  const [captionTxt, setCaptionTxt] = useState('');
  const { autoLabeling } = useTrainingImageStore(
    (state) =>
      state[modelId] ?? {
        ...(mediaType === 'video' ? defaultTrainingStateVideo : defaultTrainingState),
      }
  );
  const { updateImage } = trainingStore;
  const debounce = useDebouncer(1000);

  // this feels stupid but without it the component doesn't update when filtering
  useEffect(() => {
    setCaptionTxt(imgData.label);
  }, [imgData.label]);

  return (
    <Paper fz={12} p={6} mt={-6} radius={0} className={styles.hiText}>
      <HighlightWithinTextarea
        placeholder="Add caption..."
        readOnly={autoLabeling.isRunning}
        highlight={searchCaption.length ? searchCaption : blankTagStr}
        value={captionTxt}
        onChange={(v) => {
          setCaptionTxt(v);
          debounce(() => {
            if (imgData.label !== v) {
              updateImage(modelId, mediaType, {
                matcher: getShortNameFromUrl(imgData),
                label: v,
              });
            }
          });
        }}
        // onBlur={(e: Event) => {
        //   console.log(e);
        // }}
      />
    </Paper>
  );
};

export const TrainingImagesCaptionViewer = ({
  selectedTags,
  setSelectedTags,
  searchCaption,
  setSearchCaption,
  numImages,
}: {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  searchCaption: string;
  setSearchCaption: React.Dispatch<React.SetStateAction<string>>;
  numImages: number;
}) => {
  return (
    <Accordion variant="contained" transitionDuration={0}>
      <Accordion.Item value="caption-viewer">
        <Accordion.Control py="md" pl="md" pr={8}>
          <Group gap="xs">
            <Text>Caption Viewer</Text>
            <Badge color="indigo" leftSection={<IconPhoto size={14} />}>
              {numImages}
            </Badge>
            {(selectedTags.length > 0 || searchCaption.length > 0) && (
              <Badge color="red" leftSection={<IconFilter size={14} />}>
                {(selectedTags.length > 0 ? 1 : 0) + (searchCaption.length > 0 ? 1 : 0)}
              </Badge>
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Group>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search captions"
              value={searchCaption}
              onChange={(event) => setSearchCaption(event.currentTarget.value.toLowerCase())}
              style={{ flexGrow: 1 }}
              rightSection={
                <LegacyActionIcon
                  onClick={() => {
                    setSearchCaption('');
                  }}
                  disabled={!searchCaption.length}
                >
                  <IconX size={16} />
                </LegacyActionIcon>
              }
            />
            <Divider orientation="vertical" />
            <Switch
              // label="Find Uncaptioned"
              size="lg"
              onLabel="Missing Captions"
              offLabel="Missing Captions"
              checked={!!selectedTags.length}
              onChange={(event) =>
                setSelectedTags(event.currentTarget.checked ? [blankTagStr] : [])
              }
              styles={{ trackLabel: { fontSize: 12 } }}
            />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
