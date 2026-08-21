let lockCount = 0
let lockedScrollY = 0
let savedBodyStyles = null
let savedRootOverflow = ''

export function acquirePageScrollLock() {
  if (typeof document === 'undefined') return

  if (lockCount === 0) {
    lockedScrollY = window.scrollY
    savedBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    savedRootOverflow = document.documentElement.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.width = '100%'
  }

  lockCount += 1
}

export function releasePageScrollLock() {
  if (typeof document === 'undefined' || lockCount === 0) return false

  lockCount -= 1
  if (lockCount > 0) return false

  document.documentElement.style.overflow = savedRootOverflow
  document.body.style.overflow = savedBodyStyles?.overflow || ''
  document.body.style.position = savedBodyStyles?.position || ''
  document.body.style.top = savedBodyStyles?.top || ''
  document.body.style.width = savedBodyStyles?.width || ''
  window.scrollTo(0, lockedScrollY)

  savedBodyStyles = null
  savedRootOverflow = ''
  return true
}
