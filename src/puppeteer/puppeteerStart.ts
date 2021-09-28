import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Page } from 'puppeteer'
import { downloadKMLForPeriod, loginToTimeline } from './pageFunctions'

puppeteer.use(StealthPlugin())

// const startDate = new Date(2020, 4, 0)
// const endDate = new Date(2021, 8, 15)

const downloadKMLFromGoogleTimeline = async (
  startDate: Date,
  endDate: Date
) => {
  const browser = await puppeteer.launch({ headless: false })
  const page = (await browser.newPage()) as unknown as Page

  await loginToTimeline(page)

  await downloadKMLForPeriod(page, startDate, endDate)
}
