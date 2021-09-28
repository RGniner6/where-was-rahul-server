const getTagWithAriaLabelSelector = (tag: string, ariaLabel: string | number) =>
  `${tag}[aria-label="${ariaLabel}"]`

const getDivWithAriaLabelSelector = (ariaLabel: string | number) =>
  getTagWithAriaLabelSelector('div', ariaLabel)

const getMenuItemXpath = (menuText: string | number) =>
  `//div[@role="menuitem"]/div[text()="${menuText}"]`

export const settingsButton = getDivWithAriaLabelSelector(' Settings ')
export const exportToKMLButton = '.export-kml'
//   getDivWithAriaLabelSelector(
//   ' Export this day to KML '
// )

export const yearDropdownToggle = getDivWithAriaLabelSelector('Year')
export const monthDropdownToggle = getDivWithAriaLabelSelector('Month')
export const dayDropdownToggle = getDivWithAriaLabelSelector('Day')

export const getYearMenuItemXpath = (year: number) => getMenuItemXpath(year)
export const getMonthMenuItemXpath = (month: string) => getMenuItemXpath(month)
export const getDayMenuItemXpath = (day: number) => getMenuItemXpath(day)

export const getDayInCal = (day: number, month: string) =>
  getTagWithAriaLabelSelector('td', `${day} ${month}`)
