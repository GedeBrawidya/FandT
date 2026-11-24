export interface WishlistProgress {
  totalSaved: number
  remaining: number
  progressPercent: number
  isAchieved: boolean
}

export function calculateWishlistProgress(
  targetPrice: number,
  contributions: { amount: number }[] = []
): WishlistProgress {
  const safeTarget = Math.max(0, targetPrice)
  const totalSaved = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const remaining = Math.max(0, safeTarget - totalSaved)
  const progressPercent = safeTarget > 0 ? Math.min(100, Math.round((totalSaved / safeTarget) * 100)) : 100
  const isAchieved = safeTarget > 0 ? totalSaved >= safeTarget : true

  return {
    totalSaved,
    remaining,
    progressPercent,
    isAchieved,
  }
}

export function suggestMonthlySavingsTarget(
  targetPrice: number,
  currentSaved: number,
  targetMonths: number = 3
): number {
  const remaining = Math.max(0, targetPrice - currentSaved)
  if (remaining === 0) return 0
  const months = Math.max(1, targetMonths)
  return Math.ceil(remaining / months)
}
