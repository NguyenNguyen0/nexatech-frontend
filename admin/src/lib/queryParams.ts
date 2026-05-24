type QueryParamPrimitive = string | number | boolean

type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[] | null | undefined

export type QueryParamInput = Record<string, QueryParamValue>

export function buildQueryParams(input: QueryParamInput): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          params.append(key, String(item))
        }
      })
      return
    }

    params.append(key, String(value))
  })

  return params
}
