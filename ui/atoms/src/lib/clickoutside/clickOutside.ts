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
