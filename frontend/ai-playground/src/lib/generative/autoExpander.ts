export function autoExpand() {
  const buttons = document.querySelectorAll('.expand-collapse.collapsed')
  buttons.forEach(function (button) {
    ;(button as HTMLButtonElement).click()
  })
}
