export function expandRecordAdditionRow() {
  const buttons = document.querySelectorAll('tr.record-addition-row .expand-collapse.collapsed')

  buttons.forEach(function (button) {
    ;(button as HTMLButtonElement).click()
  })
}

export function collapseRecordAdditionRow() {
  const buttons = document.querySelectorAll('tr.record-addition-row .expand-collapse.expanded')

  buttons.forEach(function (button) {
    ;(button as HTMLButtonElement).click()
  })
}
