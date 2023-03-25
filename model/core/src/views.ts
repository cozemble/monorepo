import { ModelId } from './core'
import { uuids } from '@cozemble/lang-util'

export interface ModelViewId {
  _type: 'model.view.id'
  value: string
}

export interface ModelViewName {
  _type: 'model.view.name'
  value: string
}

export interface ModelHtmlTemplate {
  _type: 'model.html.template'
  template: string
}

export interface SummaryView {
  _type: 'summary.view'
  view: ModelHtmlTemplate
}

export interface NamingView {
  _type: 'naming.view'
  view: ModelHtmlTemplate
}

export interface ModelView {
  _type: 'model.view'
  id: ModelViewId
  name: ModelViewName
  modelId: ModelId
  view: SummaryView | NamingView
}

export const modelViewFns = {
  newInstance: (
    name: ModelViewName,
    modelId: ModelId,
    view: SummaryView | NamingView,
    id: ModelViewId = { _type: 'model.view.id', value: uuids.v4() },
  ): ModelView => {
    return {
      _type: 'model.view',
      id,
      name,
      modelId,
      view,
    }
  },
}
