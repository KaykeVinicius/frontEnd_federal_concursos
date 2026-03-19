// Simulates API calls with artificial delay to mimic real backend requests
export async function fakeApiCall<T>(data: T, delayMs = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs)
  })
}

export async function fakeApiPost<T>(data: T, delayMs = 800): Promise<{ success: boolean; data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, data }), delayMs)
  })
}

export async function fakeApiDelete(delayMs = 500): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), delayMs)
  })
}
