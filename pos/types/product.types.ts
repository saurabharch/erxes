export interface IProductBase {
  _id: string
  name: string
  unitPrice: number
  isPackage?: boolean
  uom: string
}

export interface CustomField {
  field: string
  value: string
  stringValue: string
}

export interface Group {
  fieldId: string
  title: string
}

export interface IProduct extends IProductBase {
  categoryId?: string | null
  type?: string | null
  description?: string | null
  attachment?: { url?: string } | null
  remainder?: number
  code?: string
  manufacturedDate?: string
  hasSimilarity?: boolean
  customFieldsData?: CustomField[]
}

export interface IUseProducts {
  loading: boolean
  products: IProduct[]
  productsCount: number
  handleLoadMore: () => void
}

export interface ICategory {
  _id: string
  name: string
  isRoot: boolean
  order: string
}

export interface IUom {
  _id: string
  code: string
  isForSubscription: boolean
  subscriptionConfig: {
    _id: string
    period: string
    rule: string
  }
}
