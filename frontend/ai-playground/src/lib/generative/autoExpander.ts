export function autoExpand() {
  const buttons = document.querySelectorAll('tr.record-addition-row .expand-collapse.collapsed')

  buttons.forEach(function (button) {
    ;(button as HTMLButtonElement).click()
  })
}
