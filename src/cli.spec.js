const inquirer = require('inquirer')
const mainProcess = require('./cli')
const infos = require('./project-info')
const readme = require('./readme')
const utils = require('./utils')

inquirer.prompt = jest.fn(items =>
  Promise.resolve(
    items.reduce((result, item) => {
      result[item.name] = 'value'
      return result
    }, {})
  )
)


jest.mock('./clean-context', () =>
  jest.fn(() => ({ projectName: 'readme-md-generator-after-context-clean' }))
)

describe('mainProcess', () => {

  it('should call main functions with correct args', async () => {
    const customTemplatePath = undefined
    const useDefaultAnswers = true
    const projectInformations = { name: 'readme-md-generator' }
    const readmeContent = 'content'
    const templatePath = 'path/to/template'
    infos.getProjectInfo = jest.fn(() => Promise.resolve(projectInformations))
    readme.buildReadmeContent = jest.fn(() => Promise.resolve(readmeContent))
    readme.getReadmeTemplatePath = jest.fn(() => Promise.resolve(templatePath))
    readme.checkOverwriteReadme = jest.fn(() => Promise.resolve(true))
    readme.writeReadme = jest.fn()
    utils.showEndMessage = jest.fn()

    await mainProcess({ customTemplatePath, useDefaultAnswers })

    expect(readme.getReadmeTemplatePath).toHaveBeenNthCalledWith(
      1,
      customTemplatePath,
      useDefaultAnswers
    )
    expect(infos.getProjectInfo).toHaveBeenCalledTimes(1)
    expect(readme.writeReadme).toHaveBeenNthCalledWith(1, readmeContent)
    expect(utils.showEndMessage).toHaveBeenCalledTimes(1)
  })
})
