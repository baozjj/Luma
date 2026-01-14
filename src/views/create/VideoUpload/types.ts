export interface VideoInfo {
  duration: number
  fileSize: number
  url: string
}

export interface VideoValidation {
  isValid: boolean
  error?: string
}
