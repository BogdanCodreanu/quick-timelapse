/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Me {\n  me\n}": typeof types.MeDocument,
    "\n  query MyTimelapses {\n    myTimelapses {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      updatedAt\n    }\n  }\n": typeof types.MyTimelapsesDocument,
    "\n  query Timelapse($id: ID!) {\n    timelapse(id: $id) {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      frames {\n        id\n        orderIndex\n        originalUrl\n        processedUrl\n        rotation\n        scale\n        offsetX\n        offsetY\n        width\n        height\n      }\n    }\n  }\n": typeof types.TimelapseDocument,
    "\n  mutation CreateTimelapse($input: CreateTimelapseInput!) {\n    createTimelapse(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateTimelapseDocument,
    "\n  mutation RenameTimelapse($id: ID!, $title: String!) {\n    renameTimelapse(id: $id, title: $title) {\n      id\n      title\n    }\n  }\n": typeof types.RenameTimelapseDocument,
    "\n  mutation DeleteTimelapse($id: ID!) {\n    deleteTimelapse(id: $id)\n  }\n": typeof types.DeleteTimelapseDocument,
    "\n  mutation PresignUpload($input: PresignUploadInput!) {\n    presignUpload(input: $input) {\n      url\n      key\n    }\n  }\n": typeof types.PresignUploadDocument,
    "\n  mutation CreateFrame($input: CreateFrameInput!) {\n    createFrame(input: $input) {\n      id\n      orderIndex\n      originalUrl\n      processedUrl\n      rotation\n      scale\n      offsetX\n      offsetY\n      width\n      height\n    }\n  }\n": typeof types.CreateFrameDocument,
    "\n  mutation SaveFrameTransform($input: SaveFrameTransformInput!) {\n    saveFrameTransform(input: $input) {\n      id\n      rotation\n      scale\n      offsetX\n      offsetY\n      processedUrl\n    }\n  }\n": typeof types.SaveFrameTransformDocument,
    "\n  mutation ReorderFrames($timelapseId: ID!, $orderedIds: [ID!]!) {\n    reorderFrames(timelapseId: $timelapseId, orderedIds: $orderedIds) {\n      id\n      orderIndex\n    }\n  }\n": typeof types.ReorderFramesDocument,
    "\n  mutation DeleteFrame($id: ID!) {\n    deleteFrame(id: $id)\n  }\n": typeof types.DeleteFrameDocument,
    "\n  mutation UpdateGifDelay($id: ID!, $gifDelayMs: Int!) {\n    updateGifDelay(id: $id, gifDelayMs: $gifDelayMs) {\n      id\n      gifDelayMs\n    }\n  }\n": typeof types.UpdateGifDelayDocument,
    "\n  mutation UpdateCanvas($id: ID!, $canvasWidth: Int!, $canvasHeight: Int!) {\n    updateCanvas(id: $id, canvasWidth: $canvasWidth, canvasHeight: $canvasHeight) {\n      id\n      canvasWidth\n      canvasHeight\n    }\n  }\n": typeof types.UpdateCanvasDocument,
};
const documents: Documents = {
    "query Me {\n  me\n}": types.MeDocument,
    "\n  query MyTimelapses {\n    myTimelapses {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      updatedAt\n    }\n  }\n": types.MyTimelapsesDocument,
    "\n  query Timelapse($id: ID!) {\n    timelapse(id: $id) {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      frames {\n        id\n        orderIndex\n        originalUrl\n        processedUrl\n        rotation\n        scale\n        offsetX\n        offsetY\n        width\n        height\n      }\n    }\n  }\n": types.TimelapseDocument,
    "\n  mutation CreateTimelapse($input: CreateTimelapseInput!) {\n    createTimelapse(input: $input) {\n      id\n    }\n  }\n": types.CreateTimelapseDocument,
    "\n  mutation RenameTimelapse($id: ID!, $title: String!) {\n    renameTimelapse(id: $id, title: $title) {\n      id\n      title\n    }\n  }\n": types.RenameTimelapseDocument,
    "\n  mutation DeleteTimelapse($id: ID!) {\n    deleteTimelapse(id: $id)\n  }\n": types.DeleteTimelapseDocument,
    "\n  mutation PresignUpload($input: PresignUploadInput!) {\n    presignUpload(input: $input) {\n      url\n      key\n    }\n  }\n": types.PresignUploadDocument,
    "\n  mutation CreateFrame($input: CreateFrameInput!) {\n    createFrame(input: $input) {\n      id\n      orderIndex\n      originalUrl\n      processedUrl\n      rotation\n      scale\n      offsetX\n      offsetY\n      width\n      height\n    }\n  }\n": types.CreateFrameDocument,
    "\n  mutation SaveFrameTransform($input: SaveFrameTransformInput!) {\n    saveFrameTransform(input: $input) {\n      id\n      rotation\n      scale\n      offsetX\n      offsetY\n      processedUrl\n    }\n  }\n": types.SaveFrameTransformDocument,
    "\n  mutation ReorderFrames($timelapseId: ID!, $orderedIds: [ID!]!) {\n    reorderFrames(timelapseId: $timelapseId, orderedIds: $orderedIds) {\n      id\n      orderIndex\n    }\n  }\n": types.ReorderFramesDocument,
    "\n  mutation DeleteFrame($id: ID!) {\n    deleteFrame(id: $id)\n  }\n": types.DeleteFrameDocument,
    "\n  mutation UpdateGifDelay($id: ID!, $gifDelayMs: Int!) {\n    updateGifDelay(id: $id, gifDelayMs: $gifDelayMs) {\n      id\n      gifDelayMs\n    }\n  }\n": types.UpdateGifDelayDocument,
    "\n  mutation UpdateCanvas($id: ID!, $canvasWidth: Int!, $canvasHeight: Int!) {\n    updateCanvas(id: $id, canvasWidth: $canvasWidth, canvasHeight: $canvasHeight) {\n      id\n      canvasWidth\n      canvasHeight\n    }\n  }\n": types.UpdateCanvasDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me\n}"): (typeof documents)["query Me {\n  me\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyTimelapses {\n    myTimelapses {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query MyTimelapses {\n    myTimelapses {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Timelapse($id: ID!) {\n    timelapse(id: $id) {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      frames {\n        id\n        orderIndex\n        originalUrl\n        processedUrl\n        rotation\n        scale\n        offsetX\n        offsetY\n        width\n        height\n      }\n    }\n  }\n"): (typeof documents)["\n  query Timelapse($id: ID!) {\n    timelapse(id: $id) {\n      id\n      title\n      canvasWidth\n      canvasHeight\n      gifDelayMs\n      frames {\n        id\n        orderIndex\n        originalUrl\n        processedUrl\n        rotation\n        scale\n        offsetX\n        offsetY\n        width\n        height\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTimelapse($input: CreateTimelapseInput!) {\n    createTimelapse(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTimelapse($input: CreateTimelapseInput!) {\n    createTimelapse(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RenameTimelapse($id: ID!, $title: String!) {\n    renameTimelapse(id: $id, title: $title) {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation RenameTimelapse($id: ID!, $title: String!) {\n    renameTimelapse(id: $id, title: $title) {\n      id\n      title\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTimelapse($id: ID!) {\n    deleteTimelapse(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTimelapse($id: ID!) {\n    deleteTimelapse(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PresignUpload($input: PresignUploadInput!) {\n    presignUpload(input: $input) {\n      url\n      key\n    }\n  }\n"): (typeof documents)["\n  mutation PresignUpload($input: PresignUploadInput!) {\n    presignUpload(input: $input) {\n      url\n      key\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateFrame($input: CreateFrameInput!) {\n    createFrame(input: $input) {\n      id\n      orderIndex\n      originalUrl\n      processedUrl\n      rotation\n      scale\n      offsetX\n      offsetY\n      width\n      height\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFrame($input: CreateFrameInput!) {\n    createFrame(input: $input) {\n      id\n      orderIndex\n      originalUrl\n      processedUrl\n      rotation\n      scale\n      offsetX\n      offsetY\n      width\n      height\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveFrameTransform($input: SaveFrameTransformInput!) {\n    saveFrameTransform(input: $input) {\n      id\n      rotation\n      scale\n      offsetX\n      offsetY\n      processedUrl\n    }\n  }\n"): (typeof documents)["\n  mutation SaveFrameTransform($input: SaveFrameTransformInput!) {\n    saveFrameTransform(input: $input) {\n      id\n      rotation\n      scale\n      offsetX\n      offsetY\n      processedUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReorderFrames($timelapseId: ID!, $orderedIds: [ID!]!) {\n    reorderFrames(timelapseId: $timelapseId, orderedIds: $orderedIds) {\n      id\n      orderIndex\n    }\n  }\n"): (typeof documents)["\n  mutation ReorderFrames($timelapseId: ID!, $orderedIds: [ID!]!) {\n    reorderFrames(timelapseId: $timelapseId, orderedIds: $orderedIds) {\n      id\n      orderIndex\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteFrame($id: ID!) {\n    deleteFrame(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteFrame($id: ID!) {\n    deleteFrame(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateGifDelay($id: ID!, $gifDelayMs: Int!) {\n    updateGifDelay(id: $id, gifDelayMs: $gifDelayMs) {\n      id\n      gifDelayMs\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateGifDelay($id: ID!, $gifDelayMs: Int!) {\n    updateGifDelay(id: $id, gifDelayMs: $gifDelayMs) {\n      id\n      gifDelayMs\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCanvas($id: ID!, $canvasWidth: Int!, $canvasHeight: Int!) {\n    updateCanvas(id: $id, canvasWidth: $canvasWidth, canvasHeight: $canvasHeight) {\n      id\n      canvasWidth\n      canvasHeight\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCanvas($id: ID!, $canvasWidth: Int!, $canvasHeight: Int!) {\n    updateCanvas(id: $id, canvasWidth: $canvasWidth, canvasHeight: $canvasHeight) {\n      id\n      canvasWidth\n      canvasHeight\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;