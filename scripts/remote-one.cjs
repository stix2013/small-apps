// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = require('ssh-exec')

const HOME = process.env.HOME || process.env.USERPROFILE

const command = 'cd yellowmobile && ls -alh'
// const address = 'stevan@178.162.165.82'
const config = {
  user: 'stevan',
  host: '178.162.165.82',
  port: 8422,
  key: 'id_rsa'
}

console.log('Home', HOME)

// exec(command, config, function (err, stdout, stderr) {
//   if (err) {
//     console.error('Error', err)
//   } else if (stdout) {
//     console.log(stdout)
//   } else {
//     console.log('Stderr', stderr)
//   }
// })

exec(command, config)
  .pipe(process.stdout)
