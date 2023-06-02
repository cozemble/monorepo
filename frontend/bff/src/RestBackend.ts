import type { Backend, FetchTenantResponse, TenantEntity } from './Backend'
import { recordDataErrorFns, RecordSaveFailure } from './Backend'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import axios from 'axios'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import {
  type ConflictErrorType,
  filterRequestPayloadFns,
  savableRecords,
} from '@cozemble/backend-tenanted-api-types'
import type {
  DataRecord,
  DataRecordId,
  DataRecordValuePath,
  Model,
  ModelId,
} from '@cozemble/model-core'
import {
  Id,
  modelIdFns,
  RecordAndEdges,
  RecordGraphEdge,
  RecordsAndEdges,
} from '@cozemble/model-core'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveFailed, recordSaveSucceeded } from '@cozemble/data-paginated-editor'
import { justErrorMessage, mandatory, Outcome, outcomeFns } from '@cozemble/lang-util'
import { dataRecordValuePathFns, modelFns } from '@cozemble/model-api'
import { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { dataRecordIdFns } from '@cozemble/model-core'

const axiosInstance = axios.create({
  validateStatus: function () {
    return true
  },
})

export type AccessTokenProvider = (tenantId: string) => Promise<string>
export type BackendUrlProvider = () => string

export class RestBackend implements Backend {
  constructor(
    private readonly accessTokenProvider: AccessTokenProvider,
    private readonly backendUrlProvider: BackendUrlProvider,
  ) {}

  async accessToken(tenantId: string): Promise<string> {
    return this.accessTokenProvider(tenantId)
  }

  backendUrl(): string {
    return this.backendUrlProvider()
  }

  async getTenantDetails(tenantId: string): Promise<FetchTenantResponse> {
    return fetchTenant(this.backendUrl(), tenantId, await this.accessToken(tenantId))
  }

  async deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
    const endpoints = attachmentIds.map((attachmentId) => {
      return `${this.backendUrl()}/api/v1/storage/files/${tenantId}/${attachmentId}`
    })

    const responses = await Promise.all(
      endpoints.map(async (endpoint) => {
        return axiosInstance.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${await this.accessToken(tenantId)}`,
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

  async uploadAttachments(
    tenantId: string,
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    const uploadEndpoint = `${this.backendUrl()}/api/v1/storage/files/${tenantId}`
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('file', file)
    })

    const response = await axiosInstance.post<UploadedAttachment[]>(uploadEndpoint, formData, {
      headers: {
        Authorization: `Bearer ${await this.accessToken(tenantId)}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )
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

  async getAttachmentViewUrls(
    tenantId: string,
    attachments: AttachmentIdAndFileName[],
  ): Promise<string[]> {
    const endpoints = attachments.map((a) => {
      return `${this.backendUrl()}/api/v1/storage/urls/${tenantId}/${
        a.attachmentId
      }/${encodeURIComponent(a.fileName)}`
    })

    const responses = await Promise.all(
      endpoints.map(async (endpoint) => {
        return axiosInstance.post(endpoint, null, {
          headers: {
            Authorization: `Bearer ${await this.accessToken(tenantId)}`,
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

  async fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<RecordsAndEdges> {
    const respone = await fetch(
      `${this.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${await this.accessToken(tenantId)}`,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance(search, filters)),
      },
    )
    if (!respone.ok) {
      throw new Error(`Failed to fetch records: ${respone.status} ${respone.statusText}`)
    }
    return respone.json()
  }

  async findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<RecordAndEdges | null> {
    const recordsResponse = await fetch(
      `${this.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId.value}/record/${
        recordId.value
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${await this.accessToken(tenantId)}`,
        },
      },
    )

    if (!recordsResponse.ok) {
      throw new Error(`Failed to fetch records`)
    }
    return await recordsResponse.json()
  }

  async deleteRecord(
    tenantId: string,
    modelId: string,
    record: DataRecord,
  ): Promise<RecordDeleteOutcome> {
    const recordId = record.id.value
    const saveResponse = await fetch(
      `${this.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await this.accessToken(tenantId)}`,
        },
      },
    )
    if (saveResponse.ok) {
      return recordSaveSucceeded(record)
    } else {
      return justErrorMessage(`Failed to delete record: ${saveResponse.statusText}`)
    }
  }

  async saveRecord(
    tenantId: string,
    models: Model[],
    record: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome> {
    const modelId = record.record.modelId.value
    const model = modelFns.findById(models, record.record.modelId)
    const saveResponse = await fetch(
      `${this.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.accessToken(tenantId)}`,
        },
        body: JSON.stringify(savableRecords([record.record], edges, deletedEdges)),
      },
    )
    if (saveResponse.ok) {
      return recordSaveSucceeded(record.record)
    } else {
      const response = await saveResponse.json()
      if (response._type === 'error.conflict') {
        const conflict: ConflictErrorType = response
        const valuePath = dataRecordValuePathFns.fromIds(
          models,
          model,
          ...conflict.conflictingPath.split('.'),
        )
        const valueErrors: Map<DataRecordValuePath, string[]> = new Map()
        valueErrors.set(valuePath, ['Must be unique'])
        return recordSaveFailed([`Failed to save record, has non unique values`], valueErrors)
      }
      return recordSaveFailed([saveResponse.statusText], new Map())
    }
  }

  async saveRecords(
    tenantId: string,
    models: Model[],
    records: EventSourcedDataRecord[],
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<Outcome<DataRecord[], RecordSaveFailure>> {
    const saveResponse = await fetch(`${this.backendUrl()}/api/v1/tenant/${tenantId}/record`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.accessToken(tenantId)}`,
      },
      body: JSON.stringify(
        savableRecords(
          records.map((esr) => esr.record),
          edges,
          deletedEdges,
        ),
      ),
    })

    if (saveResponse.ok) {
      return outcomeFns.successful(records.map((esr) => esr.record))
    } else {
      const response = await saveResponse.json()
      if (response._type === 'error.conflict') {
        const conflict: ConflictErrorType = response
        const model = modelFns.findById(models, modelIdFns.newInstance(conflict.conflictingModelId))
        const valuePath = dataRecordValuePathFns.fromIds(
          models,
          model,
          ...conflict.conflictingPath.split('.'),
        )
        const valueErrors: Map<DataRecordValuePath, string[]> = new Map()
        valueErrors.set(valuePath, ['Must be unique'])
        return outcomeFns.unsuccessful(
          recordDataErrorFns.newInstance(
            dataRecordIdFns.newInstance(conflict.conflictingRecordId),
            valueErrors,
          ),
        )
      }
      return outcomeFns.unsuccessful(
        justErrorMessage(`Failed to save report, got status code ${saveResponse.statusText}`),
      )
    }
  }

  async referencingRecords(
    tenantId: string,
    recordId: DataRecordId, // Customer
    referencingModelId: ModelId, // Booking
  ): Promise<DataRecord[]> {
    const url = `${this.backendUrl()}/api/v1/tenant/${tenantId}/model/${
      referencingModelId.value
    }/referencing/${recordId.value}`
    const recordsResponse = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${await this.accessToken(tenantId)}`,
      },
    })

    if (!recordsResponse.ok) {
      throw new Error(
        `Failed to fetch records at ${url}: ${recordsResponse.status} ${recordsResponse.statusText}`,
      )
    }
    const json = await recordsResponse.json()
    return mandatory(json.records, 'Missing records in response')
  }

  async putModels(tenantId: string, models: BackendModel[]): Promise<any> {
    const result = await fetch(`${this.backendUrl()}/api/v1/tenant/${tenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.accessToken(tenantId)}`,
      },
      body: JSON.stringify(models),
    })
    if (!result.ok) {
      throw new Error(`Failed to save models: ${result.statusText}`)
    }
  }

  async saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any> {
    const result = await fetch(`${this.backendUrl()}/api/v1/tenant/${tenantId}/entity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.accessToken(tenantId)}`,
      },
      body: JSON.stringify(entities),
    })
    if (!result.ok) {
      throw new Error(`Failed to save entities: ${result.statusText}`)
    }
  }

  async tradeAuthTokenForSession(
    authorizationToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await fetch(`${this.backendUrl()}/api/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorizationToken,
      }),
    })
    if (!res.ok) {
      throw new Error('Did not get access tokens')
    }
    return res.json()
  }
}

export async function fetchTenant(
  backendUrl: string,
  tenantId: string,
  accessToken: string,
): Promise<FetchTenantResponse> {
  const response = await fetch(`${backendUrl}/api/v1/tenant/${tenantId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (response.ok) {
    return response.json()
  }
  throw new Error(`Failed to fetch tenant ${tenantId}: ${response.status} ${response.statusText}`)
}
