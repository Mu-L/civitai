import type { InputWrapperProps, MantineSize } from '@mantine/core';
import { Group, Input, Text } from '@mantine/core';
import { openModal } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import type { RichTextEditorProps } from '@mantine/tiptap';
import { Link, RichTextEditor as RTE } from '@mantine/tiptap';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Color } from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import type { Editor, Extensions } from '@tiptap/react';
import { BubbleMenu, Extension, mergeAttributes, nodePasteRule, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import type { CSSProperties } from 'react';
import slugify from 'slugify';
import { InsertInstagramEmbedControl } from '~/components/RichTextEditor/InsertInstagramEmbedControl';
import { InsertStrawPollControl } from '~/components/RichTextEditor/InsertStrawPollControl';
import { useCFImageUpload } from '~/hooks/useCFImageUpload';
import { CustomImage } from '~/libs/tiptap/extensions/CustomImage';
import { Instagram } from '~/libs/tiptap/extensions/Instagram';
import { StrawPoll } from '~/libs/tiptap/extensions/StrawPoll';
import { constants } from '~/server/common/constants';
import { getRandomId, validateThirdPartyUrl } from '~/utils/string-helpers';
import { InsertImageControl } from './InsertImageControl';
import { InsertYoutubeVideoControl } from './InsertYoutubeVideoControl';
import { getSuggestions } from './suggestion';
import classes from './RichTextEditorComponent.module.scss';
import clsx from 'clsx';

// const mapEditorSizeHeight: Omit<Record<MantineSize, string>, 'xs'> = {
//   sm: '30px',
//   md: '50px',
//   lg: '70px',
//   xl: '90px',
// };

const mapEditorSize: Omit<Record<MantineSize, CSSProperties>, 'xs'> = {
  sm: {
    minHeight: 30,
    fontSize: 14,
  },
  md: {
    minHeight: 50,
  },
  lg: {
    minHeight: 70,
  },
  xl: {
    minHeight: 90,
  },
};

function openLinkWhitelistRequestModal() {
  return openModal({
    title: (
      <Group gap="xs">
        <IconAlertTriangle color="gold" />
        <Text size="lg">Blocked URL</Text>
      </Group>
    ),
    children: (
      <Text>
        The URL you entered is not allowed. You can submit a request to add it to the whitelist.
        Please follow{' '}
        <Text
          component="a"
          href="https://forms.gle/MzMCVA4mq3r4osv6A"
          target="_blank"
          rel="nofollow noreferrer"
        >
          this link
        </Text>{' '}
        to do so.
      </Text>
    ),
  });
}

const LinkWithValidation = Link.extend({
  onUpdate() {
    const url = this.editor.getAttributes('link')?.href;

    if (url) {
      const valid = validateThirdPartyUrl(url);
      if (!valid) {
        this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
        openLinkWhitelistRequestModal();
      }
    }
  },
}).configure({
  validate: (url) => {
    const valid = validateThirdPartyUrl(url);
    if (!valid) openLinkWhitelistRequestModal();

    return valid;
  },
});

const UPLOAD_NOTIFICATION_ID = 'upload-image-notification';

export function RichTextEditor({
  id,
  label,
  labelProps,
  description,
  withAsterisk,
  error,
  placeholder,
  value,
  onChange,
  includeControls = ['formatting'],
  disabled = false,
  hideToolbar = false,
  editorSize = 'sm',
  reset = 0,
  autoFocus,
  defaultSuggestions,
  innerRef,
  onSuperEnter,
  withLinkValidation,
  stickyToolbar,
  toolbarOffset = 0,
  inputClasses,
  ...props
}: Props) {
  const addHeading = includeControls.includes('heading');
  const addFormatting = includeControls.includes('formatting');
  const addColors = addFormatting && includeControls.includes('colors');
  const addList = includeControls.includes('list');
  const addLink = includeControls.includes('link');
  const addMedia = includeControls.includes('media');
  const addMentions = includeControls.includes('mentions');
  const addPolls = includeControls.includes('polls');

  const linkExtension = withLinkValidation ? LinkWithValidation : Link;

  const { uploadToCF } = useCFImageUpload();

  const extensions: Extensions = [
    Placeholder.configure({ placeholder }),
    StarterKit.configure({
      // heading: !addHeading ? false : { levels: [1, 2, 3] },
      heading: false,
      bulletList: !addList ? false : undefined,
      orderedList: !addList ? false : undefined,
      bold: !addFormatting ? false : undefined,
      italic: !addFormatting ? false : undefined,
      strike: !addFormatting ? false : undefined,
      code: !addFormatting ? false : undefined,
      blockquote: !addFormatting ? false : undefined,
      codeBlock: !addFormatting ? false : undefined,
      dropcursor: !addMedia ? false : undefined,
    }),
    ...(addHeading
      ? [
          Heading.configure({
            levels: [1, 2, 3],
          }).extend({
            addAttributes() {
              return {
                ...this.parent?.(),
                id: { default: null },
              };
            },
            addOptions() {
              return {
                ...this.parent?.(),
                HTMLAttributes: {
                  id: null,
                },
              };
            },
            renderHTML({ node }) {
              const hasLevel = this.options.levels.includes(node.attrs.level);
              const level = hasLevel ? node.attrs.level : this.options.levels[0];
              const id = `${slugify(node.textContent.toLowerCase())}-${getRandomId()}`;

              return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, { id }), 0];
            },
          }),
        ]
      : []),
    ...(onSuperEnter
      ? [
          Extension.create({
            name: 'onSubmitShortcut',
            addKeyboardShortcuts: () => ({
              'Mod-Enter': () => {
                onSuperEnter();
                return true; // Dunno why they want a boolean here
              },
            }),
          }),
        ]
      : []),
    ...(addFormatting ? [Underline] : []),
    ...(addColors ? [TextStyle, Color] : []),
    ...(addLink ? [linkExtension] : []),
    ...(addMedia
      ? [
          CustomImage.configure({
            // To allow links on images
            inline: true,
            uploadImage: uploadToCF,
            onUploadStart: () => {
              showNotification({
                id: UPLOAD_NOTIFICATION_ID,
                loading: true,
                withCloseButton: false,
                autoClose: false,
                message: 'Uploading images...',
              });
            },
            onUploadEnd: () => {
              hideNotification(UPLOAD_NOTIFICATION_ID);
            },
          }),
          Youtube.configure({
            addPasteHandler: false,
            modestBranding: false,
          }).extend({
            renderHTML(input) {
              const { HTMLAttributes } = input;
              if (!HTMLAttributes.src || !this.parent) return ['div', { 'data-youtube-video': '' }];

              return this.parent(input);
            },
            addPasteRules() {
              return [
                nodePasteRule({
                  find: /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?!.*\/channel\/)(?!\/@)(.+)?$/g,
                  type: this.type,
                  getAttributes: (match) => ({ src: match.input }),
                }),
              ];
            },
          }),
          Instagram.configure({
            HTMLAttributes: { class: classes.instagramEmbed },
            height: 'auto',
          }),
        ]
      : []),
    ...(addMentions
      ? [
          Mention.configure({
            suggestion: getSuggestions({ defaultSuggestions }),
            HTMLAttributes: {
              class: classes.mention,
            },
            renderLabel({ options, node }) {
              return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
            },
          }),
        ]
      : []),
    ...(addPolls
      ? [
          StrawPoll.configure({
            HTMLAttributes: { class: classes.strawPollEmbed },
            height: 'auto',
          }),
        ]
      : []),
  ];

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: onChange ? ({ editor }) => onChange(editor.getHTML()) : undefined,
    editable: !disabled,
    immediatelyRender: false,
  });

  const editorRef = useRef<Editor>();

  // To clear content after a form submission
  useEffect(() => {
    if (!value && editor) editor.commands.clearContent();
  }, [editor, value]);

  useEffect(() => {
    if (reset > 0 && editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [reset]); //eslint-disable-line

  useEffect(() => {
    if (editor && autoFocus) editor.commands.focus('end', { scrollIntoView: true });
  }, [editor, autoFocus]);

  useEffect(() => {
    if (editor && !editorRef.current) editorRef.current = editor;
  }, [editor]);

  // Used to call editor commands outside the component via a ref
  useImperativeHandle(innerRef, () => ({
    insertContentAtCursor: (value) => {
      if (editorRef.current && innerRef) {
        const currentPosition = editorRef.current.state.selection.$anchor.pos;
        editorRef.current.commands.insertContentAt(currentPosition, value);
      }
    },
    focus: () => {
      if (editorRef.current && innerRef) {
        editorRef.current.commands.focus('end');
      }
    },
  }));

  const editorSizeStyles = mapEditorSize[editorSize] || mapEditorSize.sm;

  return (
    <Input.Wrapper
      id={id}
      label={label}
      labelProps={labelProps}
      description={description}
      withAsterisk={withAsterisk}
      error={error}
      className={inputClasses}
    >
      <RTE
        {...props}
        editor={editor}
        id={id}
        classNames={{
          ...props.classNames,
          content: clsx(
            classes.richTextEditor,
            props.classNames && 'content' in props.classNames ? props.classNames.content : undefined
          ),
          toolbar: clsx(
            'border-l border-l-gray-4 dark:border-l-dark-4',
            props.classNames && 'toolbar' in props.classNames ? props.classNames.toolbar : undefined
          ),
        }}
        style={
          {
            '--editor-min-height': editorSizeStyles.minHeight
              ? `${editorSizeStyles.minHeight}px`
              : undefined,
            '--editor-font-size': editorSizeStyles.fontSize
              ? `${editorSizeStyles.fontSize}px`
              : undefined,
          } as React.CSSProperties
        }
      >
        {!hideToolbar && (
          <RTE.Toolbar sticky={stickyToolbar} stickyOffset={toolbarOffset}>
            {addHeading && (
              <RTE.ControlsGroup>
                <RTE.H1 />
                <RTE.H2 />
                <RTE.H3 />
              </RTE.ControlsGroup>
            )}

            {addFormatting && (
              <RTE.ControlsGroup>
                <RTE.Bold />
                <RTE.Italic />
                <RTE.Underline />
                <RTE.Strikethrough />
                <RTE.ClearFormatting />
                <RTE.CodeBlock />
                {addColors && (
                  <RTE.ColorPicker colors={[...constants.richTextEditor.presetColors]} />
                )}
              </RTE.ControlsGroup>
            )}

            {addList && (
              <RTE.ControlsGroup>
                <RTE.BulletList />
                <RTE.OrderedList />
              </RTE.ControlsGroup>
            )}

            {addLink && (
              <RTE.ControlsGroup>
                <RTE.Link />
                <RTE.Unlink />
              </RTE.ControlsGroup>
            )}

            {addMedia && (
              <RTE.ControlsGroup>
                <InsertImageControl />
                <InsertYoutubeVideoControl />
                <InsertInstagramEmbedControl />
              </RTE.ControlsGroup>
            )}
            {addPolls && (
              <RTE.ControlsGroup>
                <InsertStrawPollControl />
              </RTE.ControlsGroup>
            )}
          </RTE.Toolbar>
        )}

        {editor && (
          // Don't show the bubble menu for images, to prevent setting images as headings, etc.
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => !editor.state.selection.empty && !editor.isActive('image')}
            className={classes.bubbleTooltip}
          >
            <RTE.ControlsGroup>
              {addHeading ? (
                <>
                  <RTE.H1 />
                  <RTE.H2 />
                  <RTE.H3 />
                </>
              ) : null}
              {addFormatting ? (
                <>
                  <RTE.Bold />
                  <RTE.Italic />
                </>
              ) : null}
              {addList ? <RTE.BulletList /> : null}
              {addLink ? <RTE.Link /> : null}
            </RTE.ControlsGroup>
          </BubbleMenu>
        )}

        <RTE.Content />
      </RTE>
    </Input.Wrapper>
  );
}

export type EditorCommandsRef = {
  insertContentAtCursor: (value: string) => void;
  focus: () => void;
};

type ControlType =
  | 'heading'
  | 'formatting'
  | 'list'
  | 'link'
  | 'media'
  | 'mentions'
  | 'polls'
  | 'colors';
export type Props = Omit<RichTextEditorProps, 'editor' | 'children' | 'onChange'> &
  Pick<InputWrapperProps, 'label' | 'labelProps' | 'description' | 'withAsterisk' | 'error'> & {
    value?: string;
    includeControls?: ControlType[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    hideToolbar?: boolean;
    editorSize?: 'sm' | 'md' | 'lg' | 'xl';
    reset?: number;
    autoFocus?: boolean;
    defaultSuggestions?: Array<{ id: number; label: string }>;
    innerRef?: React.ForwardedRef<EditorCommandsRef>;
    onSuperEnter?: () => void;
    withLinkValidation?: boolean;
    stickyToolbar?: boolean;
    toolbarOffset?: number;
    inputClasses?: string;
  };
