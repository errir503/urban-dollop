export const BLOCK_ICON_DEFAULT = 'block-default';

/**
 * Array of valid keys in a block type settings deprecation object.
 *
 * @type {string[]}
 */
export const DEPRECATED_ENTRY_KEYS = [
	'attributes',
	'supports',
	'save',
	'migrate',
	'isEligible',
	'apiVersion',
];

export const __EXPERIMENTAL_STYLE_PROPERTY = {
	// Kept for back-compatibility purposes.
	'--wp--style--color--link': {
		value: [ 'color', 'link' ],
		support: [ 'color', 'link' ],
	},
	background: {
		value: [ 'color', 'gradient' ],
		support: [ 'color', 'gradients' ],
	},
	backgroundColor: {
		value: [ 'color', 'background' ],
		support: [ 'color', 'background' ],
		requiresOptOut: true,
	},
	borderColor: {
		value: [ 'border', 'color' ],
		support: [ '__experimentalBorder', 'color' ],
	},
	borderRadius: {
		value: [ 'border', 'radius' ],
		support: [ '__experimentalBorder', 'radius' ],
		properties: {
			borderTopLeftRadius: 'topLeft',
			borderTopRightRadius: 'topRight',
			borderBottomLeftRadius: 'bottomLeft',
			borderBottomRightRadius: 'bottomRight',
		},
	},
	borderStyle: {
		value: [ 'border', 'style' ],
		support: [ '__experimentalBorder', 'style' ],
	},
	borderWidth: {
		value: [ 'border', 'width' ],
		support: [ '__experimentalBorder', 'width' ],
	},
	borderTopColor: {
		value: [ 'border', 'top', 'color' ],
		support: [ '__experimentalBorder', 'color' ],
	},
	borderTopStyle: {
		value: [ 'border', 'top', 'style' ],
		support: [ '__experimentalBorder', 'style' ],
	},
	borderTopWidth: {
		value: [ 'border', 'top', 'width' ],
		support: [ '__experimentalBorder', 'width' ],
	},
	borderRightColor: {
		value: [ 'border', 'right', 'color' ],
		support: [ '__experimentalBorder', 'color' ],
	},
	borderRightStyle: {
		value: [ 'border', 'right', 'style' ],
		support: [ '__experimentalBorder', 'style' ],
	},
	borderRightWidth: {
		value: [ 'border', 'right', 'width' ],
		support: [ '__experimentalBorder', 'width' ],
	},
	borderBottomColor: {
		value: [ 'border', 'bottom', 'color' ],
		support: [ '__experimentalBorder', 'color' ],
	},
	borderBottomStyle: {
		value: [ 'border', 'bottom', 'style' ],
		support: [ '__experimentalBorder', 'style' ],
	},
	borderBottomWidth: {
		value: [ 'border', 'bottom', 'width' ],
		support: [ '__experimentalBorder', 'width' ],
	},
	borderLeftColor: {
		value: [ 'border', 'left', 'color' ],
		support: [ '__experimentalBorder', 'color' ],
	},
	borderLeftStyle: {
		value: [ 'border', 'left', 'style' ],
		support: [ '__experimentalBorder', 'style' ],
	},
	borderLeftWidth: {
		value: [ 'border', 'left', 'width' ],
		support: [ '__experimentalBorder', 'width' ],
	},
	color: {
		value: [ 'color', 'text' ],
		support: [ 'color', 'text' ],
		requiresOptOut: true,
	},
	filter: {
		value: [ 'filter', 'duotone' ],
		support: [ 'color', '__experimentalDuotone' ],
	},
	linkColor: {
		value: [ 'elements', 'link', 'color', 'text' ],
		support: [ 'color', 'link' ],
	},
	fontFamily: {
		value: [ 'typography', 'fontFamily' ],
		support: [ 'typography', '__experimentalFontFamily' ],
	},
	fontSize: {
		value: [ 'typography', 'fontSize' ],
		support: [ 'typography', 'fontSize' ],
	},
	fontStyle: {
		value: [ 'typography', 'fontStyle' ],
		support: [ 'typography', '__experimentalFontStyle' ],
	},
	fontWeight: {
		value: [ 'typography', 'fontWeight' ],
		support: [ 'typography', '__experimentalFontWeight' ],
	},
	lineHeight: {
		value: [ 'typography', 'lineHeight' ],
		support: [ 'typography', 'lineHeight' ],
	},
	margin: {
		value: [ 'spacing', 'margin' ],
		support: [ 'spacing', 'margin' ],
		properties: {
			marginTop: 'top',
			marginRight: 'right',
			marginBottom: 'bottom',
			marginLeft: 'left',
		},
		useEngine: true,
	},
	padding: {
		value: [ 'spacing', 'padding' ],
		support: [ 'spacing', 'padding' ],
		properties: {
			paddingTop: 'top',
			paddingRight: 'right',
			paddingBottom: 'bottom',
			paddingLeft: 'left',
		},
		useEngine: true,
	},
	textDecoration: {
		value: [ 'typography', 'textDecoration' ],
		support: [ 'typography', '__experimentalTextDecoration' ],
	},
	textTransform: {
		value: [ 'typography', 'textTransform' ],
		support: [ 'typography', '__experimentalTextTransform' ],
	},
	letterSpacing: {
		value: [ 'typography', 'letterSpacing' ],
		support: [ 'typography', '__experimentalLetterSpacing' ],
	},
	'--wp--style--block-gap': {
		value: [ 'spacing', 'blockGap' ],
		support: [ 'spacing', 'blockGap' ],
	},
};

export const __EXPERIMENTAL_ELEMENTS = {
	link: 'a',
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
};

export const __EXPERIMENTAL_PATHS_WITH_MERGE = {
	'color.duotone': true,
	'color.gradients': true,
	'color.palette': true,
	'typography.fontFamilies': true,
	'typography.fontSizes': true,
};
