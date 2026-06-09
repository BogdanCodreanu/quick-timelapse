/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateFrameInput = {
  height?: number | null | undefined;
  originalKey: string;
  timelapseId: string | number;
  width?: number | null | undefined;
};

export type CreateTimelapseInput = {
  canvasHeight?: number | null | undefined;
  canvasWidth?: number | null | undefined;
  title?: string | null | undefined;
};

export type PresignUploadInput = {
  contentType: string;
  frameId?: string | number | null | undefined;
  kind: UploadKind;
  timelapseId: string | number;
};

export type SaveFrameTransformInput = {
  frameId: string | number;
  offsetX: number;
  offsetY: number;
  processedKey?: string | null | undefined;
  rotation: number;
  scale: number;
};

export type UploadKind =
  | 'ORIGINAL'
  | 'PROCESSED';

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: string | null };

export type MyTimelapsesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyTimelapsesQuery = { myTimelapses: Array<{ id: string, title: string, canvasWidth: number, canvasHeight: number, gifDelayMs: number, updatedAt: string }> };

export type TimelapseQueryVariables = Exact<{
  id: string | number;
}>;


export type TimelapseQuery = { timelapse: { id: string, title: string, canvasWidth: number, canvasHeight: number, gifDelayMs: number, frames: Array<{ id: string, orderIndex: number, originalUrl: string, processedUrl: string | null, rotation: number, scale: number, offsetX: number, offsetY: number, width: number | null, height: number | null, locked: boolean }> } | null };

export type CreateTimelapseMutationVariables = Exact<{
  input: CreateTimelapseInput;
}>;


export type CreateTimelapseMutation = { createTimelapse: { id: string } };

export type RenameTimelapseMutationVariables = Exact<{
  id: string | number;
  title: string;
}>;


export type RenameTimelapseMutation = { renameTimelapse: { id: string, title: string } };

export type DeleteTimelapseMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteTimelapseMutation = { deleteTimelapse: boolean };

export type PresignUploadMutationVariables = Exact<{
  input: PresignUploadInput;
}>;


export type PresignUploadMutation = { presignUpload: { url: string, key: string } };

export type CreateFrameMutationVariables = Exact<{
  input: CreateFrameInput;
}>;


export type CreateFrameMutation = { createFrame: { id: string, orderIndex: number, originalUrl: string, processedUrl: string | null, rotation: number, scale: number, offsetX: number, offsetY: number, width: number | null, height: number | null, locked: boolean } };

export type SaveFrameTransformMutationVariables = Exact<{
  input: SaveFrameTransformInput;
}>;


export type SaveFrameTransformMutation = { saveFrameTransform: { id: string, rotation: number, scale: number, offsetX: number, offsetY: number, processedUrl: string | null } };

export type SetFrameLockedMutationVariables = Exact<{
  id: string | number;
  locked: boolean;
}>;


export type SetFrameLockedMutation = { setFrameLocked: { id: string, locked: boolean } };

export type ReorderFramesMutationVariables = Exact<{
  timelapseId: string | number;
  orderedIds: Array<string | number> | string | number;
}>;


export type ReorderFramesMutation = { reorderFrames: Array<{ id: string, orderIndex: number }> };

export type DeleteFrameMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteFrameMutation = { deleteFrame: boolean };

export type UpdateGifDelayMutationVariables = Exact<{
  id: string | number;
  gifDelayMs: number;
}>;


export type UpdateGifDelayMutation = { updateGifDelay: { id: string, gifDelayMs: number } };

export type UpdateCanvasMutationVariables = Exact<{
  id: string | number;
  canvasWidth: number;
  canvasHeight: number;
}>;


export type UpdateCanvasMutation = { updateCanvas: { id: string, canvasWidth: number, canvasHeight: number } };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MyTimelapsesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTimelapses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTimelapses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"canvasWidth"}},{"kind":"Field","name":{"kind":"Name","value":"canvasHeight"}},{"kind":"Field","name":{"kind":"Name","value":"gifDelayMs"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyTimelapsesQuery, MyTimelapsesQueryVariables>;
export const TimelapseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Timelapse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timelapse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"canvasWidth"}},{"kind":"Field","name":{"kind":"Name","value":"canvasHeight"}},{"kind":"Field","name":{"kind":"Name","value":"gifDelayMs"}},{"kind":"Field","name":{"kind":"Name","value":"frames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"originalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"processedUrl"}},{"kind":"Field","name":{"kind":"Name","value":"rotation"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}},{"kind":"Field","name":{"kind":"Name","value":"offsetX"}},{"kind":"Field","name":{"kind":"Name","value":"offsetY"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"locked"}}]}}]}}]}}]} as unknown as DocumentNode<TimelapseQuery, TimelapseQueryVariables>;
export const CreateTimelapseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTimelapse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTimelapseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTimelapse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTimelapseMutation, CreateTimelapseMutationVariables>;
export const RenameTimelapseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RenameTimelapse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renameTimelapse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<RenameTimelapseMutation, RenameTimelapseMutationVariables>;
export const DeleteTimelapseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTimelapse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTimelapse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTimelapseMutation, DeleteTimelapseMutationVariables>;
export const PresignUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PresignUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PresignUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"presignUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<PresignUploadMutation, PresignUploadMutationVariables>;
export const CreateFrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFrame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFrameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFrame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"originalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"processedUrl"}},{"kind":"Field","name":{"kind":"Name","value":"rotation"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}},{"kind":"Field","name":{"kind":"Name","value":"offsetX"}},{"kind":"Field","name":{"kind":"Name","value":"offsetY"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"locked"}}]}}]}}]} as unknown as DocumentNode<CreateFrameMutation, CreateFrameMutationVariables>;
export const SaveFrameTransformDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveFrameTransform"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveFrameTransformInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveFrameTransform"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rotation"}},{"kind":"Field","name":{"kind":"Name","value":"scale"}},{"kind":"Field","name":{"kind":"Name","value":"offsetX"}},{"kind":"Field","name":{"kind":"Name","value":"offsetY"}},{"kind":"Field","name":{"kind":"Name","value":"processedUrl"}}]}}]}}]} as unknown as DocumentNode<SaveFrameTransformMutation, SaveFrameTransformMutationVariables>;
export const SetFrameLockedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFrameLocked"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locked"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFrameLocked"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"locked"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locked"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"locked"}}]}}]}}]} as unknown as DocumentNode<SetFrameLockedMutation, SetFrameLockedMutationVariables>;
export const ReorderFramesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderFrames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timelapseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderFrames"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timelapseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timelapseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderedIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]} as unknown as DocumentNode<ReorderFramesMutation, ReorderFramesMutationVariables>;
export const DeleteFrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFrame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFrame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFrameMutation, DeleteFrameMutationVariables>;
export const UpdateGifDelayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGifDelay"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gifDelayMs"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGifDelay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"gifDelayMs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gifDelayMs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gifDelayMs"}}]}}]}}]} as unknown as DocumentNode<UpdateGifDelayMutation, UpdateGifDelayMutationVariables>;
export const UpdateCanvasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCanvas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canvasWidth"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canvasHeight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCanvas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"canvasWidth"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canvasWidth"}}},{"kind":"Argument","name":{"kind":"Name","value":"canvasHeight"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canvasHeight"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canvasWidth"}},{"kind":"Field","name":{"kind":"Name","value":"canvasHeight"}}]}}]}}]} as unknown as DocumentNode<UpdateCanvasMutation, UpdateCanvasMutationVariables>;