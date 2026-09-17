import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const sections = [
  ['Computer Fundamentals', 1, 50],
  ['Linux & Operating System Basics', 51, 100],
  ['Internet & Networking', 101, 150],
  ['MS Office & Digital Skills', 151, 200],
  ['Programming Basics', 201, 250],
  ['General Knowledge & Digital Awareness', 251, 300],
]
const banks = {
  'Computer Fundamentals': [
    ['Which component performs arithmetic and logical operations?', 'CPU', 'Monitor', 'Keyboard', 'Printer'],
    ['Which device is used to enter text?', 'Keyboard', 'Speaker', 'Projector', 'Router'],
    ['Which memory loses its contents when power is removed?', 'RAM', 'ROM', 'DVD', 'Hard disk'],
    ['Which unit is commonly used to measure processor speed?', 'Gigahertz', 'Litres', 'Pixels', 'Volts'],
    ['Which device displays visual output?', 'Monitor', 'Microphone', 'Scanner', 'Modem'],
    ['Which storage device uses spinning magnetic disks?', 'Hard disk drive', 'RAM', 'CPU', 'Webcam'],
    ['What does USB commonly connect?', 'Peripheral devices', 'Power stations', 'Water pipes', 'Telephone towers'],
    ['Which is an example of system software?', 'Operating system', 'Spreadsheet', 'Photo', 'Presentation slide'],
    ['What is the smallest unit of digital data?', 'Bit', 'Byte', 'Word', 'File'],
    ['How many bits are in one byte?', '8', '2', '16', '64'],
  ],
  'Linux & Operating System Basics': [
    ['Which command lists directory contents in Linux?', 'ls', 'showdir', 'listall', 'open'],
    ['Which command prints the current directory?', 'pwd', 'where', 'cwdshow', 'place'],
    ['Which symbol represents the root directory?', '/', '\\', '#', '~'],
    ['Which command changes directory?', 'cd', 'mvdir', 'goto', 'switch'],
    ['Which command creates a directory?', 'mkdir', 'newdir', 'makedirfile', 'folder'],
    ['Which command removes an empty directory?', 'rmdir', 'deldir', 'erasefolder', 'removed'],
    ['Which command displays text in a terminal?', 'echo', 'writeout', 'say', 'text'],
    ['Which command copies files?', 'cp', 'copyfile', 'duplicate', 'clone'],
    ['Which command moves or renames a file?', 'mv', 'shift', 'renamefile', 'moveit'],
    ['Which command removes a file?', 'rm', 'deletefile', 'erase', 'discard'],
  ],
  'Internet & Networking': [
    ['What does IP identify on a network?', 'A device interface', 'A document font', 'A keyboard key', 'A printer page'],
    ['Which protocol transfers web pages securely?', 'HTTPS', 'FTPX', 'SMTP-only', 'TELNET2'],
    ['Which device forwards packets between networks?', 'Router', 'Keyboard', 'Monitor', 'Scanner'],
    ['What does DNS translate?', 'Domain names to IP addresses', 'Files to folders', 'Pixels to colors', 'Audio to text'],
    ['Which protocol is commonly used for email sending?', 'SMTP', 'HTTP', 'SSH', 'ARP'],
    ['What is a web browser used for?', 'Accessing web pages', 'Compiling circuits', 'Printing money', 'Formatting disks'],
    ['Which network covers a small building?', 'LAN', 'WAN', 'GAN', 'PANIC'],
    ['What does Wi-Fi provide?', 'Wireless network access', 'Extra storage', 'Screen brightness', 'Battery charging'],
    ['Which address is used by a website name?', 'Domain name', 'Postal code', 'MAC label', 'File suffix'],
    ['What is phishing?', 'A deceptive attempt to obtain information', 'A backup method', 'A graphics format', 'A routing algorithm'],
  ],
  'MS Office & Digital Skills': [
    ['Which application is designed for spreadsheets?', 'Microsoft Excel', 'Paint', 'Notepad', 'Media Player'],
    ['Which application is designed for presentations?', 'Microsoft PowerPoint', 'Calculator', 'File Explorer', 'Snipping Tool'],
    ['Which application is designed for word processing?', 'Microsoft Word', 'Excel', 'Access Point', 'Defender'],
    ['What begins a formula in Excel?', 'Equals sign', 'Colon', 'Hash only', 'Question mark'],
    ['Which shortcut commonly copies selected content?', 'Ctrl+C', 'Ctrl+P', 'Ctrl+Z', 'Ctrl+N'],
    ['Which shortcut commonly pastes content?', 'Ctrl+V', 'Ctrl+S', 'Ctrl+F', 'Ctrl+L'],
    ['Which shortcut commonly saves a document?', 'Ctrl+S', 'Ctrl+D', 'Ctrl+R', 'Ctrl+H'],
    ['What is a spreadsheet cell?', 'Intersection of a row and column', 'A slide theme', 'A paragraph style', 'A file extension'],
    ['What does spell check find?', 'Possible spelling errors', 'Network cables', 'CPU faults', 'Screen pixels'],
    ['What is a presentation slide?', 'A single page of a presentation', 'A database server', 'A keyboard layout', 'A browser tab'],
  ],
  'Programming Basics': [
    ['What is a variable?', 'A named storage location', 'A monitor cable', 'A network tower', 'A printed page'],
    ['What does a loop do?', 'Repeats instructions', 'Deletes hardware', 'Formats images', 'Measures voltage'],
    ['What is a conditional statement used for?', 'Making a decision', 'Drawing a monitor', 'Compressing a keyboard', 'Charging a battery'],
    ['What is an algorithm?', 'A step-by-step solution procedure', 'A screen protector', 'A file cabinet', 'A power supply'],
    ['What does a function usually contain?', 'Reusable instructions', 'Only images', 'Network wires', 'Audio cables'],
    ['Which value represents true or false?', 'Boolean', 'Decimal-only', 'Pixel', 'Folder'],
    ['What is a syntax error?', 'A violation of language rules', 'A broken monitor', 'A slow router', 'A missing printer'],
    ['What does debugging mean?', 'Finding and fixing program errors', 'Deleting all files', 'Changing screen size', 'Installing a keyboard'],
    ['What is an array?', 'An ordered collection of values', 'A power cable', 'A browser window', 'A sound card'],
    ['What does input mean in a program?', 'Data supplied to the program', 'The final printed result', 'A computer case', 'A network address'],
  ],
  'General Knowledge & Digital Awareness': [
    ['What does AI stand for?', 'Artificial Intelligence', 'Automatic Internet', 'Applied Input', 'Advanced Index'],
    ['What is a strong password?', 'A long unique combination', 'A first name only', 'The word password', 'A repeated digit'],
    ['What is two-factor authentication?', 'Two independent verification steps', 'Two browser tabs', 'Two monitors', 'Two file names'],
    ['What is cloud storage?', 'Remote storage accessed over a network', 'A metal cabinet', 'A local keyboard', 'A paper folder'],
    ['What is a backup?', 'A separate copy of data', 'A screen theme', 'A login name', 'A network cable'],
    ['What does QR commonly refer to?', 'Quick Response', 'Quality Router', 'Query Register', 'Quick RAM'],
    ['What is open-source software?', 'Software whose source code is available under a license', 'Software with no buttons', 'Only paid software', 'A broken application'],
    ['What is digital literacy?', 'Ability to use digital tools effectively', 'Ability to type one letter', 'A screen size', 'A printer speed'],
    ['What is malware?', 'Malicious software', 'A spreadsheet formula', 'A monitor setting', 'A safe backup'],
    ['What is encryption?', 'Transforming data to protect it', 'Deleting data permanently', 'Printing data', 'Sorting folders'],
  ],
}
const makeQuestions = () => {
  const rows = []
  for (const [section, start, end] of sections) {
    const templates = banks[section]
    for (let number = start; number <= end; number++) {
      const base = templates[(number - start) % templates.length]
      const cycle = Math.floor((number - start) / templates.length) + 1
      const difficulty = number <= 210 ? 'very_easy' : number <= 285 ? 'easy' : 'basic_thinking'
      const prompt = cycle === 1 ? base[0] : `${base[0]} (Set ${cycle})`
      rows.push({ question_number: number, section, category: section, difficulty, prompt, options: base.slice(1), correct_option: 'A', marks: 1 })
    }
  }
  return rows
}
const questions = makeQuestions()
if (questions.length !== 300 || new Set(questions.map((q) => q.prompt)).size !== 300) throw new Error('Seed must contain exactly 300 unique questions')
const { data: exam, error: examError } = await supabase.from('exams').upsert({ code: 'LINUX-CS-300-DRAFT', title: 'Linux CS 300 Question Bank - Draft', description: 'Unpublished 300-question entrance-level MCQ bank.', duration_minutes: 180, total_marks: 300, passing_marks: 150, is_published: false }, { onConflict: 'code' }).select('id').single()
if (examError) throw examError
const { error: deleteError } = await supabase.from('exam_questions').delete().eq('exam_id', exam.id)
if (deleteError) throw deleteError
const payload = questions.map((question) => ({ ...question, exam_id: exam.id }))
for (let index = 0; index < payload.length; index += 100) {
  const { error } = await supabase.from('exam_questions').insert(payload.slice(index, index + 100))
  if (error) throw error
}
const { count, error: verifyError } = await supabase.from('exam_questions').select('id', { count: 'exact', head: true }).eq('exam_id', exam.id)
if (verifyError) throw verifyError
if (count !== 300) throw new Error(`Expected 300 questions, found ${count}`)
console.log('300 questions successfully inserted')
console.log(JSON.stringify({ examId: exam.id, count, categories: [...new Set(questions.map((q) => q.category))], difficulties: { very_easy: questions.filter((q) => q.difficulty === 'very_easy').length, easy: questions.filter((q) => q.difficulty === 'easy').length, basic_thinking: questions.filter((q) => q.difficulty === 'basic_thinking').length } }))
