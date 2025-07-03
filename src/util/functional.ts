export async function safePromise<T>(promise: Promise<T>): Promise<[T, null] | [null, Error]> {
  try {
    const result = await promise
    return [result, null]
  } catch (error) {
    if (error instanceof Error) {
      return [null, error]
    } else {
      return [null, new Error('Unknown error occurred')]
    }
  }
}

export function splitArray<T>(arr: Array<T>, split: number): Array<Array<T>> {
  const result: Array<Array<T>> = []

  for (let i = 0; i < arr.length; i += split) {
    result.push(arr.slice(i, i + split))
  }

  return result
}