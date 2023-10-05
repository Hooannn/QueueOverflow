export interface IResponse<T> {
  code: number
  message?: string
  data?: T
  success?: boolean
  total?: number
  took?: number
}
class Response<T> implements IResponse<T> {
  code: number
  message?: string
  data?: T
  success?: boolean
  total?: number
  took?: number

  constructor(res: IResponse<T>) {
    Object.keys(res).forEach(key => {
      if (res[key]) this[key] = res[key]
    })
  }
}
export default Response
