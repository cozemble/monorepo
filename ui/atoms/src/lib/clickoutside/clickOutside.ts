export function isEffectivelyVisible(element: HTMLElement | null) {
  while (element) {
    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility !== 'visible') return false
    element = element.parentElement
  }
  return true
}

export function clickOutside(node: any) {
  const handleClick = (event: any) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      const detail = { node, clickedNode: event.target }
      const clickOutsideEvent = new CustomEvent('click_outside', { detail })
      node.dispatchEvent(clickOutsideEvent)
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}

export function clickOutsideWhenVisible(node: any) {
  const handleClick = (event: any) => {
    if (
      node &&
      !node.contains(event.target) &&
      !event.defaultPrevented &&
      isEffectivelyVisible(node)
    ) {
      const detail = { node, clickedNode: event.target }
      const clickOutsideEvent = new CustomEvent('click_outside', { detail })
      node.dispatchEvent(clickOutsideEvent)
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}
