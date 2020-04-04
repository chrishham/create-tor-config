const fs = require('fs-extra')
const path = require('path')
const homedir = require('os').homedir()
const shell = require('shelljs')
const colors = require('colors')
  ;
(async function () {
  console.log('Setting up Tor...'.green + '\n')
  try {
    if (!process.env.TOR_CONTROL_PASSWORD) throw new Error('env variable TOR_CONTROL_PASSWORD is not defined!')
    if (!process.env.TOR_NUM_OF_PROCESSES) throw new Error('env variable TOR_NUM_OF_PROCESSES is not defined!')
    if (!shell.which('tor')) throw new Error('Tor is not installed. Install Tor and run this command again.')

    console.log(`TOR_CONTROL_PASSWORD : ${process.env.TOR_CONTROL_PASSWORD}`.green)
    console.log(`TOR_NUM_OF_PROCESSES : ${process.env.TOR_NUM_OF_PROCESSES}\n`.green)

    const { stdout } = shell.exec(`tor --hash-password ${process.env.TOR_CONTROL_PASSWORD}`, { silent: true })
    const torHash = stdout

    let startSocksPort = 9050 - 2
    let startControlPort = 9051 - 2

    const socksPorts = []
    const controlPorts = []

    await fs.remove(path.join(homedir, 'tor'))

    // for (key in process.env) {
    //   if (/^TOR_/.test(key)) console.log(key)
    // }

    let startTorScript = ` rm -rf ${path.join(homedir, 'tor', 'Data', '*')}`

    for (let i = 0; i < process.env.TOR_NUM_OF_PROCESSES; i++) {
      startSocksPort = startSocksPort + 2
      startControlPort = startControlPort + 2

      socksPorts.push(startSocksPort)
      controlPorts.push(startControlPort)

      let thisConfiguration = '\n HashedControlPassword ' + torHash
      thisConfiguration += '\n ControlPort ' + startControlPort
      thisConfiguration += '\n SOCKSPort ' + startSocksPort
      thisConfiguration += '\n ExitNodes {us}'
      thisConfiguration += `\n DataDirectory ${homedir}/tor/Data/tor${i}`

      await fs.ensureDir(path.join(homedir, 'tor', 'Configurations'))
      await fs.ensureDir(path.join(homedir, 'tor', 'Data'))

      await fs.writeFile(path.join(homedir, 'tor', 'Configurations', `torrc.${i}`), thisConfiguration)

      startTorScript += '\n tor -f ' + homedir + '/tor/Configurations/torrc.' + i + ' &'
    }

    await fs.writeFile(path.join(homedir, 'tor', 'startTors.sh'), startTorScript)
    console.log(`Tor folder was succesfully created : ${path.join(homedir, 'tor')}\n`.green)
    console.log(`To start ${process.env.TOR_NUM_OF_PROCESSES} Tor processes, run the following commands:\n`.yellow)
    console.log('sudo killall tor'.blue)
    console.log(`bash ${path.join(homedir, 'tor', 'startTors.sh')}\n`.blue)
    console.log('If you want to run the script at System reboot:\n'.green)
    console.log('crontab -e\n'.blue)
    console.log('Then add the following lines to the crontab file:\n'.green)
    console.log(`@reboot bash ${path.join(homedir, 'tor', 'startTors.sh')}  >> ${path.join(homedir, 'tor', 'log')} 2>&1`.blue)
    console.log(`0 * * * * echo '' > ${path.join(homedir, 'tor', 'log')}\n`.blue)
  } catch (e) {
    console.log(`ERROR: ${e.message}`.red + '\n')
    process.exit(1)
  }
})()