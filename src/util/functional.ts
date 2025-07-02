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
