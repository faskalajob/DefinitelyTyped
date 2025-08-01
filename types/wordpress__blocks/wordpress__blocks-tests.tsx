import * as blocks from "@wordpress/blocks";
import { dispatch, select } from "@wordpress/data";

// $ExpectType BlocksStoreDescriptor
blocks.store;

// $ExpectType "core/blocks"
blocks.store.name;

const BLOCK: blocks.Block<{ foo: string }> = {
    attributes: {
        foo: {
            type: "string",
            default: "foo",
        },
    },
    category: "common",
    deprecated: [
        {
            attributes: {
                bar: {
                    type: "string",
                },
            },
            migrate(attributes) {
                return { foo: attributes.bar };
            },
            save: () => null,
        },
    ],
    edit: () => null,
    icon: {
        src: "block-default",
    },
    name: "my/foo",
    save: () => null,
    title: "Foo",
};

const BLOCK_INSTANCE: blocks.BlockInstance<{ foo: string }> = {
    attributes: {
        foo: "bar",
    },
    clientId: "abc123",
    innerBlocks: [],
    isValid: true,
    name: "my/foo",
};

//
// block-content-provider
// ----------------------------------------------------------------------------
(() => {
    interface Props {
        foo: string;
        BlockContent: string;
    }
    const OriginalComponent = ({ BlockContent, foo }: Props) => (
        <div>
            <h1>{foo}</h1>
            {BlockContent}
        </div>
    );
    const Enhanced = blocks.withBlockContentContext(OriginalComponent);
    <Enhanced foo="bar" BlockContent="cont" />;
})();

//
// categories
// ----------------------------------------------------------------------------

// $ExpectType Category[]
blocks.getCategories();

// $ExpectType void
blocks.setCategories([{ slug: "foo", title: "Foo", icon: null }]);

// $ExpectType void
blocks.updateCategory("foo", { title: "Foobar" });

//
// children
// ----------------------------------------------------------------------------

// $ExpectType (string | number | ReactElement<any, string | JSXElementConstructor<any>>)[]
blocks.children.fromDOM(document.querySelectorAll("div"));

// $ExpectType (domNode: Node & ParentNode) => (string | number | ReactElement<any, string | JSXElementConstructor<any>>)[]
blocks.children.matcher(".foo");

//
// factory
// ----------------------------------------------------------------------------

// $ExpectType BlockInstance<{ foo: string; }>
blocks.cloneBlock(BLOCK_INSTANCE);

// $ExpectType BlockInstance<{ foo: string; }>
blocks.createBlock("my/foo", { foo: "bar" });

blocks.findTransform(
    [
        {
            type: "block",
            blocks: [],
            priority: 1,
            transform() {
                return blocks.createBlock("my/foo");
            },
        },
    ],
    transform => transform.type === "block",
);

declare const RAW_TRANSFORM_ARRAY: Array<blocks.TransformRaw<any>>;
blocks.findTransform(RAW_TRANSFORM_ARRAY, ({}) => true);
blocks.findTransform(RAW_TRANSFORM_ARRAY, ({ isMatch }) => isMatch?.(new Node()) ?? true);

// $ExpectType string
blocks.getBlockTransforms("to", "my/foo")[0].blockName;

// $ExpectType string
blocks.getBlockTransforms<{ foo: string }>("to", "my/foo")[0].blockName;

// $ExpectType Block<Record<string, any>>[]
blocks.getPossibleBlockTransformations([BLOCK_INSTANCE]);

// $ExpectType BlockInstance<{ [k: string]: any; }>[] | null
blocks.switchToBlockType(BLOCK_INSTANCE, "core/paragraph");

// $ExpectType BlockInstance<{ [k: string]: any; }>[] | null
blocks.switchToBlockType([BLOCK_INSTANCE], "core/paragraph");

//
// parser
// ----------------------------------------------------------------------------

// $ExpectType Record<string, any>
blocks.getBlockAttributes("my/foo", "<div>hello world</div>");

// $ExpectType { foo: string; }
blocks.getBlockAttributes(BLOCK, "<div>hello world</div>");

const TEST_HTML = `
    <main id="root">
        <p data-foo="bar" data-baz="false">
            Hello World!
        </p>
        <button disabled class="my-button">Click me</button>
        <p>
            Lorem ipsum
        </p>
    </main>
`;

// $ExpectType boolean | undefined
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "attribute",
    selector: "button",
    attribute: "disabled",
    type: "boolean",
});

// $ExpectType string | undefined
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "attribute",
    selector: "button",
    attribute: "class",
});

// $ExpectType string | undefined
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "html",
    selector: "#root",
});

// $ExpectType string | undefined
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "html",
    selector: "#root",
    multiline: "p",
});

// $ExpectType string | undefined
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "text",
    selector: "#root",
});

// $ExpectType (string | number | ReactElement<any, string | JSXElementConstructor<any>>)[]
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "children",
    selector: "#root",
});

// $ExpectType (string | number | ReactElement<any, string | JSXElementConstructor<any>>)[]
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "children",
});

blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "node",
    selector: "#root",
});

blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "node",
});

blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "tag",
    selector: "#root",
});

blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "tag",
});

// $ExpectType { foo: boolean | undefined; bar: { baz: string | undefined; qux: string | undefined; }; }
blocks.parseWithAttributeSchema(TEST_HTML, {
    source: "query",
    selector: "#root",
    query: {
        foo: {
            source: "attribute",
            attribute: "id",
            type: "boolean",
        },
        bar: {
            source: "query",
            query: {
                baz: {
                    source: "text",
                },
                qux: {
                    source: "children",
                },
            },
        },
    },
});

//
// raw-handling
// ----------------------------------------------------------------------------

// $ExpectType PhrasingContentSchema
blocks.getPhrasingContentSchema();

// $ExpectType string
blocks.pasteHandler({ HTML: "<p>hello world</p>", mode: "INLINE" });

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.pasteHandler({ HTML: "<p>hello world</p>", mode: "BLOCKS" });

// $ExpectType string | BlockInstance<{ [k: string]: any; }>[]
blocks.pasteHandler({ HTML: "<p>hello world</p>", mode: "AUTO" });

// $ExpectType string | BlockInstance<{ [k: string]: any; }>[]
blocks.pasteHandler({ HTML: "<p>hello world</p>" });

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.rawHandler({ HTML: "<p>hello world</p>" });

//
// registration
// ----------------------------------------------------------------------------

// $ExpectType unknown
blocks.getBlockSupport(BLOCK, "align");

// $ExpectType unknown
blocks.getBlockSupport("core/paragraph", "anchor");

// $ExpectType string
blocks.getBlockSupport("core/paragraph", "inserter", "Hello World");

// $ExpectType number
blocks.getBlockSupport("core/paragraph", "inserter", 1234);

// $ExpectType { foo: string; }
blocks.getBlockSupport("core/paragraph", "inserter", { foo: "bar" });

// $ExpectType Block<Record<string, any>> | undefined
blocks.getBlockType("core/paragraph");

// $ExpectType Block<any>[]
blocks.getBlockTypes();

// $ExpectType string[]
blocks.getChildBlockNames("core/columns");

// $ExpectType string | undefined
blocks.getDefaultBlockName();

// $ExpectType string | undefined
blocks.getFreeformContentHandlerName();

// $ExpectType string | undefined
blocks.getGroupingBlockName();

// $ExpectType string | undefined
blocks.getUnregisteredTypeHandlerName();

// $ExpectType boolean
blocks.hasBlockSupport(BLOCK, "className");

// $ExpectType boolean
blocks.hasBlockSupport(BLOCK, "alignWide", true);

// $ExpectType boolean
blocks.hasChildBlocks("core/columns");

// $ExpectType boolean
blocks.hasChildBlocksWithInserterSupport("core/columns");

// $ExpectType boolean
blocks.isReusableBlock(BLOCK);

// $ExpectType boolean
blocks.isReusableBlock(BLOCK_INSTANCE);

// $ExpectType void
blocks.registerBlockStyle("my/foo", { name: "foo__bar", label: "Foobar" });

// $ExpectType Block<{}> | undefined
blocks.registerBlockType("my/foo", {
    attributes: {},
    icon: () => null,
    title: "Foo",
    category: "common",
});

// $ExpectType Block<{}> | undefined
blocks.registerBlockType("my/foo", {
    attributes: {},
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z" />
        </svg>
    ),
    title: "Foo",
    category: "common",
});

// $ExpectType Block<{ foo: string; }> | undefined
blocks.registerBlockType<{ foo: string }>("my/foo", {
    attributes: {
        foo: {
            type: "string",
        },
    },
    icon: {
        src: "carrot",
        foreground: "orange",
        background: "green",
    },
    title: "Foo",
    category: "common",
});

// $ExpectType Block<{ foo: string; }> | undefined
blocks.registerBlockType<{ foo: string }>("my/foo", {
    attributes: {
        foo: {
            type: "string",
            enum: ["bar", "baz"],
        },
    },
    icon: {
        src: "carrot",
        foreground: "orange",
        background: "green",
    },
    title: "Foo",
    category: "common",
});

// $ExpectType Block<{ foo: object; }> | undefined
blocks.registerBlockType<{ foo: object }>("my/foo", {
    attributes: {
        foo: {
            type: "object",
        },
    },
    icon: {
        src: "carrot",
        foreground: "orange",
        background: "green",
    },
    title: "Foo",
    category: "common",
});

// $ExpectType Block<{ foo: string; }> | undefined
blocks.registerBlockType<{ foo: string }>("my/foo", {
    attributes: {
        foo: "string",
    },
    icon: {
        src: "carrot",
        foreground: "orange",
        background: "green",
    },
    title: "Foo",
    category: "common",
});

// Register with block.json metadata and no client-side settings.
// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/
blocks.registerBlockType({
    apiVersion: 2,
    name: "my-plugin/notice",
    title: "Notice",
    category: "text",
    parent: ["core/group"],
    ancestor: ["core/group"],
    icon: "star-half",
    description: "Shows warning, error or success notices…",
    keywords: ["alert", "message"],
    version: "1.0.3",
    textdomain: "my-plugin",
    attributes: {
        message: {
            type: "string",
            source: "html",
            selector: ".message",
        },
    },
    providesContext: {
        "my-plugin/message": "message",
    },
    usesContext: ["groupId"],
    supports: {
        align: true,
        color: {
            background: true,
            gradients: false,
            link: true,
            text: true,
        },
        spacing: {
            blockGap: ["horizontal"],
            margin: ["top", "left"],
        },
        typography: {
            fontSize: true,
            lineHeight: false,
        },
        lock: true,
    },
    styles: [
        { name: "default", label: "Default", isDefault: true },
        { name: "other", label: "Other" },
    ],
    example: {
        attributes: {
            message: "This is a notice!",
        },
        innerBlocks: [
            {
                name: "core/paragraph",
                attributes: {
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
                },
                innerBlocks: [
                    {
                        name: "core/paragraph",
                        attributes: {
                            content:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
                        },
                    },
                ],
            },
        ],
    },
    editorScript: "file:./build/index.js",
    script: "file:./build/script.js",
    editorStyle: "file:./build/index.css",
    style: "file:./build/style.css",
});

// Register with block.json metadata and additional client-side settings.
blocks.registerBlockType(
    {
        apiVersion: 2,
        name: "my-plugin/notice",
        title: "Notice",
        category: "text",
        parent: ["core/group"],
        ancestor: ["core/group"],
        icon: "star-half",
        description: "Shows warning, error or success notices…",
        keywords: ["alert", "message"],
        version: "1.0.3",
        textdomain: "my-plugin",
        attributes: {
            message: {
                type: "string",
                source: "html",
                selector: ".message",
            },
        },
        providesContext: {
            "my-plugin/message": "message",
        },
        usesContext: ["groupId"],
        supports: {
            align: true,
        },
        styles: [
            { name: "default", label: "Default", isDefault: true },
            { name: "other", label: "Other" },
        ],
        example: {
            attributes: {
                message: "This is a notice!",
            },
            innerBlocks: [
                {
                    name: "core/paragraph",
                    attributes: {
                        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
                    },
                    innerBlocks: [
                        {
                            name: "core/paragraph",
                            attributes: {
                                content:
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
                            },
                        },
                    ],
                },
            ],
        },
        editorScript: "file:./build/index.js",
        script: "file:./build/script.js",
        editorStyle: "file:./build/index.css",
        style: "file:./build/style.css",
    },
    { edit: () => null, save: () => null },
);

// $ExpectType void
blocks.setDefaultBlockName("my/foo");

// $ExpectType void
blocks.setFreeformContentHandlerName("my/foo");

// $ExpectType void
blocks.setGroupingBlockName("my/foo");

// $ExpectType void
blocks.setUnregisteredTypeHandlerName("my/foo");

// $ExpectType void
blocks.unregisterBlockStyle("my/foo", "foo__bar");

// $ExpectType Block<any> | undefined
blocks.unregisterBlockType("my/foo");

// $ExpectType BlockVariation<BlockAttributes>[] | undefined || BlockVariation<Record<string, any>>[] | undefined
blocks.getBlockVariations("core/columns");

// $ExpectType void
blocks.registerBlockVariation("core/columns", {
    name: "core/columns/variation",
    title: "Core Column Variation",
    innerBlocks: [
        ["core/paragraph"],
        [
            "core/paragraph",
            { placeholder: "Enter side content..." },
            [["core/paragraph"]],
        ],
    ],
});

// $ExpectType void
blocks.unregisterBlockVariation("core/columns", "core/columns/variation");

//
// serializer
// ----------------------------------------------------------------------------

// $ExpectType string
blocks.getBlockContent(BLOCK_INSTANCE);

// $ExpectType string
blocks.getBlockDefaultClassName("my/foo");

// $ExpectType string
blocks.getBlockMenuDefaultClassName("my/foo");

// $ExpectType string
blocks.getSaveContent("my/foo", { foo: "bar" });

// $ExpectType string
blocks.getSaveContent(BLOCK, { foo: "bar" }, []);

// @ts-expect-error
blocks.getSavecontent(BLOCK, false, []);

// $ExpectType string | number | ReactElement<any, string | JSXElementConstructor<any>>
blocks.getSaveElement("my/foo", { foo: "bar" });

// $ExpectType string | number | ReactElement<any, string | JSXElementConstructor<any>>
blocks.getSaveElement(BLOCK, { foo: "bar" });

// @ts-expect-error
blocks.getSaveElement(BLOCK, false, []);

// $ExpectType string
blocks.serialize([BLOCK_INSTANCE, BLOCK_INSTANCE]);

//
// templates
// ----------------------------------------------------------------------------

// $ExpectType boolean
blocks.doBlocksMatchTemplate();

// $ExpectType boolean
blocks.doBlocksMatchTemplate([BLOCK_INSTANCE]);

// $ExpectType boolean
blocks.doBlocksMatchTemplate(
    [BLOCK_INSTANCE, BLOCK_INSTANCE],
    [["core/test-block"], ["core/test-block-2", {}, [["core/test-block"]]], ["core/test-block-2"]],
);

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.synchronizeBlocksWithTemplate();

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.synchronizeBlocksWithTemplate([BLOCK_INSTANCE, BLOCK_INSTANCE]);

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.synchronizeBlocksWithTemplate(
    [BLOCK_INSTANCE, BLOCK_INSTANCE],
    [
        ["my/foo", { foo: "bar" }],
        ["my/foo", { foo: "bar" }],
    ],
);

// $ExpectType BlockInstance<{ [k: string]: any; }>[]
blocks.synchronizeBlocksWithTemplate(undefined, [
    ["my/foo", { foo: "bar" }],
    ["my/foo", { foo: "bar" }],
]);

//
// editor interaction
// ----------------------------------------------------------------------------

// $ExpectType ComponentType<BlockEditProps<{ foo: string; }>> | undefined
blocks.getBlockType<{ foo: string }>("my/foo")?.edit;

//
// utils
// ----------------------------------------------------------------------------

// $ExpectType boolean
blocks.isUnmodifiedDefaultBlock(BLOCK_INSTANCE);

// $ExpectType boolean
blocks.isValidIcon(23);

// $ExpectType boolean
blocks.isValidIcon(() => null);

// $ExpectType boolean
blocks.isValidIcon("block-default");

// $ExpectType BlockIconNormalized
blocks.normalizeIconObject("carrot");

// $ExpectType BlockIconNormalized
blocks.normalizeIconObject(() => null);

// $ExpectType BlockIconNormalized
blocks.normalizeIconObject({ src: "carrot", foreground: "orange" });

//
// validation
// ----------------------------------------------------------------------------

// $ExpectType boolean
blocks.isValidBlockContent("my/foo", { foo: "bar" }, "Foobar");

// $ExpectType boolean
blocks.isValidBlockContent(BLOCK, { foo: "bar" }, "Foobar");

// @ts-expect-error
blocks.isValidBlockContent(BLOCK, false, true);

//
// stores
// ----------------------------------------------------------------------------

// $ExpectType readonly BlockStyle[] | undefined
select("core/blocks").getBlockStyles("my/foo");

// $ExpectType string | undefined
select("core/blocks").getFreeformFallbackBlockName();

// $ExpectType string | undefined
select("core/blocks").getUnregisteredFallbackBlockName();

// $ExpectType boolean
select("core/blocks").isMatchingSearchTerm("my/foo", "foo");

// $ExpectType boolean
select("core/blocks").isMatchingSearchTerm(BLOCK, "foo");

// $ExpectType void
dispatch("core/blocks").addBlockStyles("my/foo", { name: "foo__bar", label: "Foobar" });

// $ExpectType void
dispatch("core/blocks").setDefaultBlockName("my/foo");
