import { axiosInstance } from "@/lib/axiosInstance"

export interface OnboardingData {
  primaryGoal: string
  biggestChallenge: string
  workStyle: string
  focusArea: string
  firstGoal?: string | null
  wantsBuddy?: boolean
  buddyEmail?: string | null
}

export interface OnboardingStatus {
  onboardingCompleted: boolean
  onboardingData: OnboardingData | null
}

export const completeOnboarding = async (data: OnboardingData) => {
  const response = await axiosInstance.post("/onboarding/complete", data)
  return response.data
}

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const response = await axiosInstance.get("/onboarding/status")
  return response.data
}

