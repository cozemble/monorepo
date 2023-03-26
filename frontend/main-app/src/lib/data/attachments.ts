import type { UploadedAttachment } from '@cozemble/data-editor-sdk'
import { config } from '../config'
import axios from 'axios'
import { cozauth } from '../auth/cozauth'

const axiosInstance = axios.create({
  validateStatus: function () {
    return true
  },
})

async function mandatoryAccessToken(tenantId: string) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  return accessToken
}

export async function uploadAttachments(
  tenantId: string,
  files: File[],
  progressUpdater: (percent: number) => void,
): Promise<UploadedAttachment[]> {
  const accessToken = await mandatoryAccessToken(tenantId)

  const uploadEndpoint = `${config.backendUrl()}/api/v1/storage/files/${tenantId}`
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('file', file)
  })

  const response = await axiosInstance.post<UploadedAttachment[]>(uploadEndpoint, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
      progressUpdater(percentCompleted)
    },
  })
  if (response.status >= 300) {
    throw new Error(`Failed to upload attachments: ${response.status} ${response.statusText}`)
  }

  return response.data.map((uploadResponse: any, index: number) => ({
    _type: 'uploaded.attachment',
    attachmentId: uploadResponse.fileId,
    file: files[index],
    size: null,
    thumbnailUrl: uploadResponse.thumbnailUrl,
  }))
}

export async function deleteAttachments(tenantId: string, attachmentIds: string[]) {
  const accessToken = await mandatoryAccessToken(tenantId)

  const endpoints = attachmentIds.map((attachmentId) => {
    return `${config.backendUrl()}/api/v1/storage/files/${tenantId}/${attachmentId}`
  })

  const responses = await Promise.all(
    endpoints.map((endpoint) => {
      return axiosInstance.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }),
  )
  const firstBadResponse = responses.find((response) => response.status >= 300) ?? null
  if (firstBadResponse) {
    throw new Error(
      `Failed to delete attachments: ${firstBadResponse.status} ${firstBadResponse.statusText}`,
    )
  }
}

export async function getAttachmentViewUrls(
  tenantId: string,
  attachmentIds: string[],
): Promise<string[]> {
  const accessToken = await mandatoryAccessToken(tenantId)
  const endpoints = attachmentIds.map((attachmentId) => {
    return `${config.backendUrl()}/api/v1/storage/urls/${tenantId}/${attachmentId}`
  })

  const responses = await Promise.all(
    endpoints.map((endpoint) => {
      return axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }),
  )
  const firstBadResponse = responses.find((response) => response.status >= 300) ?? null
  if (firstBadResponse) {
    throw new Error(
      `Failed to get view url: ${firstBadResponse.status} ${firstBadResponse.statusText}`,
    )
  }

  return responses.map((response) => response.data.url)
}
