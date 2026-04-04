import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.locale('vi')

export default dayjs
