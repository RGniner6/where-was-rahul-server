import { Page } from 'puppeteer'
import {
  dayDropdownToggle,
  exportToKMLButton,
  getDayInCal,
  getMonthMenuItemXpath,
  getYearMenuItemXpath,
  monthDropdownToggle,
  settingsButton,
  yearDropdownToggle,
} from './timelinePageSelectors'
import { getDateDetails } from './dateTimeHelpers'
import { eachDayOfInterval, format } from 'date-fns'
import { outputJSON } from 'fs-extra'
import { SRC_ROOT_PATH } from '../server'
import { join } from 'path'

export const loginToTimeline = async (page: Page) => {
  const { username, password } = getLoginCredentials()
  await page.goto('https://timeline.google.com/')

  await page.waitForSelector('input[type="email"]')
  await page.click('input[type="email"]')
  await page.type('input[type="email"]', username)

  await page.waitForSelector('#identifierNext')
  await page.click('#identifierNext')

  await page.waitForTimeout(4 * 1000)
  await page.waitForSelector('input[type="password"]')
  await page.click('input[type="password"]')
  await page.type('input[type="password"]', password)

  await page.waitForSelector('#passwordNext')
  await page.click('#passwordNext')

  await page.waitForTimeout(10 * 1000)
  await page.waitForNavigation()
}

export function getLoginCredentials() {
  const username = process.env.username
  const password = process.env.username
  if (!username || !password) {
    throw new Error(
      `Make sure you have a .env file defined at the root of the repo. ` +
        `It needs to have 'username' and 'password' defined with your google account credentials`
    )
  }
  return {
    username,
    password,
  }
}

export async function downloadKMLForPeriod(page: Page, from: Date, to: Date) {
  const selectedDays = eachDayOfInterval({ start: from, end: to })
  for (const day of selectedDays) {
    await downloadKMLForDate(page, day)
  }
}

export async function downloadKMLForDate(page: Page, date: Date) {
  try {
    await selectAGivenDate(page, date)
    await page.waitForTimeout(5 * 1000)
    await exportCurrentDateToKml(page)
    await page.waitForTimeout(5 * 1000)
  } catch (err) {
    await writeToErrorLog(date, err)
  }
}

export const selectAGivenDate = async (page: Page, date: Date) => {
  const { day, month, monthThreeLetter, year } = getDateDetails(date)

  await clickBySelector(page, yearDropdownToggle)
  await clickByXpath(page, getYearMenuItemXpath(year))
  await clickBySelector(page, monthDropdownToggle)
  await clickByXpath(page, getMonthMenuItemXpath(month))
  await clickBySelector(page, dayDropdownToggle)
  await clickBySelector(page, getDayInCal(day, monthThreeLetter))
}

export const exportCurrentDateToKml = async (page: Page) => {
  await page.waitForSelector(settingsButton)
  await page.click(settingsButton)
  await page.waitForTimeout(1000)
  await clickExportButton(page)
}

const clickByXpath = async (page: Page, xpath: string) => {
  const elements = await page.$x(xpath)
  const element = elements[elements.length - 1]
  console.log(
    `[Click Attempt] : ${xpath}, Num elements found: ${elements.length}`
  )
  await element.click()
}

const clickBySelector = async (page: Page, selector: string) => {
  await page.waitForSelector(selector)
  await page.click(selector)
  await page.waitForTimeout(500)
}

const clickExportButton = async (page: Page) => {
  const element = await page.$(exportToKMLButton)
  await element.evaluate((el) => el.click())
}

const failedDates = new Map<string, Error>()
const writeToErrorLog = async (date: Date, err: Error) => {
  const dateString = format(date, 'd-M-Y')
  failedDates.set(dateString, err)
  const errorLog = Object.fromEntries(failedDates)
  const logLocation = join(SRC_ROOT_PATH, '..', 'errors.json')
  await outputJSON(logLocation, errorLog)
}
