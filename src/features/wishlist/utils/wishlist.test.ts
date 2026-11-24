import { describe, it, expect } from 'vitest'
import { calculateWishlistProgress, suggestMonthlySavingsTarget } from './wishlist'

describe('calculateWishlistProgress', () => {
  it('calculates progress percentage and remaining amount correctly', () => {
    const targetPrice = 10000000 // 10 juta
    const contributions = [
      { amount: 2500000 },
      { amount: 2500000 },
    ]

    const result = calculateWishlistProgress(targetPrice, contributions)

    expect(result.totalSaved).toBe(5000000)
    expect(result.remaining).toBe(5000000)
    expect(result.progressPercent).toBe(50)
    expect(result.isAchieved).toBe(false)
  })

  it('marks as achieved when total saved reaches target price', () => {
    const targetPrice = 5000000
    const contributions = [
      { amount: 3000000 },
      { amount: 2000000 },
    ]

    const result = calculateWishlistProgress(targetPrice, contributions)

    expect(result.totalSaved).toBe(5000000)
    expect(result.remaining).toBe(0)
    expect(result.progressPercent).toBe(100)
    expect(result.isAchieved).toBe(true)
  })

  it('caps progress percent at 100 even if overfunded', () => {
    const targetPrice = 1000000
    const contributions = [{ amount: 1500000 }]

    const result = calculateWishlistProgress(targetPrice, contributions)

    expect(result.totalSaved).toBe(1500000)
    expect(result.remaining).toBe(0)
    expect(result.progressPercent).toBe(100)
    expect(result.isAchieved).toBe(true)
  })

  it('handles 0 target price gracefully', () => {
    const result = calculateWishlistProgress(0, [])

    expect(result.totalSaved).toBe(0)
    expect(result.remaining).toBe(0)
    expect(result.progressPercent).toBe(100)
    expect(result.isAchieved).toBe(true)
  })
})

describe('suggestMonthlySavingsTarget', () => {
  it('calculates equal monthly target based on remaining and months', () => {
    const target = 12000000
    const currentSaved = 3000000 // remaining 9 juta
    const suggested = suggestMonthlySavingsTarget(target, currentSaved, 3)

    expect(suggested).toBe(3000000)
  })

  it('returns 0 when already reached target', () => {
    const suggested = suggestMonthlySavingsTarget(5000000, 5000000, 3)
    expect(suggested).toBe(0)
  })
})
