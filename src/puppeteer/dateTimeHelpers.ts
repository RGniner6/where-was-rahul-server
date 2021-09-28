import { format } from 'date-fns'

type DateDetails = {
  month: string
  year: number
  monthThreeLetter: string
  day: number
}
export const getDateDetails = (date: Date): DateDetails => {
  const year = date.getFullYear()
  const month = format(date, 'MMMM')
  const monthThreeLetter = format(date, 'MMM')
  const day = Number(format(date, 'd'))

  return {
    day,
    month,
    year,
    monthThreeLetter,
  }
}
