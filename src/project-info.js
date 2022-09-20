const ora = require('ora')

const { getPackageJson } = require('./utils')

/**
 * Get project informations from git and package.json
 */
const getProjectInfos = async () => {
  const spinner = ora('Gathering project infos').start()

  const packageJson = await getPackageJson()
  console.info(packageJson)

  spinner.succeed('Project infos gathered')

  return packageJson
}

module.exports = {
  getProjectInfo: getProjectInfos
}
