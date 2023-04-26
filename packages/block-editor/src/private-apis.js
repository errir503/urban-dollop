/**
 * Internal dependencies
 */
import * as globalStyles from './components/global-styles';
import { ExperimentalBlockEditorProvider } from './components/provider';
import { lock } from './lock-unlock';
import OffCanvasEditor from './components/off-canvas-editor';
import LeafMoreMenu from './components/off-canvas-editor/leaf-more-menu';
import ResizableBoxPopover from './components/resizable-box-popover';
import { ComposedPrivateInserter as PrivateInserter } from './components/inserter';
import { PrivateListView } from './components/list-view';
import BlockInfo from './components/block-info-slot-fill';
import { useShouldContextualToolbarShow } from './utils/use-should-contextual-toolbar-show';
import { cleanEmptyObject } from './hooks/utils';

/**
 * Private @wordpress/block-editor APIs.
 */
export const privateApis = {};
lock( privateApis, {
	...globalStyles,
	ExperimentalBlockEditorProvider,
	LeafMoreMenu,
	OffCanvasEditor,
	PrivateInserter,
	PrivateListView,
	ResizableBoxPopover,
	BlockInfo,
	useShouldContextualToolbarShow,
	cleanEmptyObject,
} );
