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

exec(command, config)
  .pipe(process.stdout)
