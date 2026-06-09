import { graphql } from '@/gql';

export const MyTimelapsesQuery = graphql(`
  query MyTimelapses {
    myTimelapses {
      id
      title
      canvasWidth
      canvasHeight
      gifDelayMs
      updatedAt
    }
  }
`);

export const TimelapseQuery = graphql(`
  query Timelapse($id: ID!) {
    timelapse(id: $id) {
      id
      title
      canvasWidth
      canvasHeight
      gifDelayMs
      frames {
        id
        orderIndex
        originalUrl
        processedUrl
        rotation
        scale
        offsetX
        offsetY
        width
        height
        locked
      }
    }
  }
`);

export const CreateTimelapseMutation = graphql(`
  mutation CreateTimelapse($input: CreateTimelapseInput!) {
    createTimelapse(input: $input) {
      id
    }
  }
`);

export const RenameTimelapseMutation = graphql(`
  mutation RenameTimelapse($id: ID!, $title: String!) {
    renameTimelapse(id: $id, title: $title) {
      id
      title
    }
  }
`);

export const DeleteTimelapseMutation = graphql(`
  mutation DeleteTimelapse($id: ID!) {
    deleteTimelapse(id: $id)
  }
`);

export const PresignUploadMutation = graphql(`
  mutation PresignUpload($input: PresignUploadInput!) {
    presignUpload(input: $input) {
      url
      key
    }
  }
`);

export const CreateFrameMutation = graphql(`
  mutation CreateFrame($input: CreateFrameInput!) {
    createFrame(input: $input) {
      id
      orderIndex
      originalUrl
      processedUrl
      rotation
      scale
      offsetX
      offsetY
      width
      height
      locked
    }
  }
`);

export const SaveFrameTransformMutation = graphql(`
  mutation SaveFrameTransform($input: SaveFrameTransformInput!) {
    saveFrameTransform(input: $input) {
      id
      rotation
      scale
      offsetX
      offsetY
      processedUrl
    }
  }
`);

export const SetFrameLockedMutation = graphql(`
  mutation SetFrameLocked($id: ID!, $locked: Boolean!) {
    setFrameLocked(id: $id, locked: $locked) {
      id
      locked
    }
  }
`);

export const ReorderFramesMutation = graphql(`
  mutation ReorderFrames($timelapseId: ID!, $orderedIds: [ID!]!) {
    reorderFrames(timelapseId: $timelapseId, orderedIds: $orderedIds) {
      id
      orderIndex
    }
  }
`);

export const DeleteFrameMutation = graphql(`
  mutation DeleteFrame($id: ID!) {
    deleteFrame(id: $id)
  }
`);

export const UpdateGifDelayMutation = graphql(`
  mutation UpdateGifDelay($id: ID!, $gifDelayMs: Int!) {
    updateGifDelay(id: $id, gifDelayMs: $gifDelayMs) {
      id
      gifDelayMs
    }
  }
`);

export const UpdateCanvasMutation = graphql(`
  mutation UpdateCanvas($id: ID!, $canvasWidth: Int!, $canvasHeight: Int!) {
    updateCanvas(id: $id, canvasWidth: $canvasWidth, canvasHeight: $canvasHeight) {
      id
      canvasWidth
      canvasHeight
    }
  }
`);
