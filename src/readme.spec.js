const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chooseTemplate = require('./choose-template')

const defaultTemplatePath = path.resolve(__dirname, '../templates/default.md')
const defaultNoHtmlTemplatePath = path.resolve(
  __dirname,
  '../templates/default-no-html.md'
)
chooseTemplate.mockReturnValue(defaultTemplatePath)

const {
  writeReadme,
  buildReadmeContent,
  README_PATH,
  getReadmeTemplatePath
} = require('./readme')

describe('readme', () => {
  const succeed = jest.fn()
  const fail = jest.fn()

  ora.mockReturnValue({
    start: () => ({
      succeed,
      fail
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('writeReadme', () => {
    it('should call ora with correct parameters in success case', async () => {
      const readmeContent = 'content'
      fs.writeFile = jest.fn((_, __, cb) => cb(null, 'done'))

      await writeReadme(readmeContent)

      expect(ora).toHaveBeenCalledTimes(1)
      expect(ora).toHaveBeenCalledWith('Creating README')
      expect(succeed).toHaveBeenCalledTimes(1)
      expect(succeed).toHaveBeenCalledWith('README created')
    })

    it('should call ora with correct parameters in fail case', async () => {
      const readmeContent = 'content'
      fs.writeFile = jest.fn(() => {
        throw new Error('error')
      })

      try {
        await writeReadme(readmeContent)
        // eslint-disable-next-line no-empty
      } catch (err) {}

      expect(ora).toHaveBeenCalledTimes(1)
      expect(ora).toHaveBeenCalledWith('Creating README')
      expect(fail).toHaveBeenCalledTimes(1)
      expect(fail).toHaveBeenCalledWith('README creation fail')
    })

    it('should call writeFile with correct parameters', async () => {
      const readmeContent = 'John &amp; Bryan'
      fs.writeFile = jest.fn((_, __, cb) => cb(null, 'done'))

      await writeReadme(readmeContent)

      expect(fs.writeFile).toHaveBeenCalledTimes(1)
      expect(fs.writeFile.mock.calls[0][0]).toBe(README_PATH)
      expect(fs.writeFile.mock.calls[0][1]).toBe('John & Bryan')
    })
  })

  describe('buildReadmeContent', () => {
    const context = {
      project: {
        name: 'Readme MD generator Json based',
        overview: 'Project description',
        version: '2.1.1',
        repository: {
          link: 'https://gogole.com.br',
          deployment: 'https://gogole.com.br'
        },
        badges: [
          {
            name: 'badge',
            type: 'google',
            link: 'https://gogole.com.br'
          }
        ],
        gettingStarted: {
          prerequisites: {
            description:
              'This are the required components required to start and run this service',
            dependencies: [
              {
                Java: '11'
              },
              {
                Postgres: '11'
              },
              {
                'Pubsub-emulator': null
              },
              {
                'docker-compose': null
              }
            ]
          },
          setup: {
            description:
              'These is the step required to start and Run this service locally',
            command:
              'mvn clean isntall spring-boot:run -Dspring-boot.run.profiles=local'
          },
          test: {
            description: 'This are the steps to run tests.',
            command: 'mvn clean install verify'
          },
          usage: {
            description: 'Use the Open API specification',
            command: 'N/A'
          }
        },
        contributing: {
          description:
            'We welcome contributions to our code. These are the steps to contribute here: </br> 1 - Documentation regarding the change </br> 2 - Design meeting with the team </br> 3 - Create a PR'
        },
        team: {
          name: 'Team Name',
          contact: 'ask--team--name',
          link: 'https://slack-channel-link',
          homePage: '',
          members: ['Rafa Azeredo']
        }
      }
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call ora with correct parameters in success case', async () => {
      await buildReadmeContent(context, defaultTemplatePath)

      expect(ora).toHaveBeenCalledTimes(1)
      expect(ora).toHaveBeenCalledWith('Loading README template')
      expect(succeed).toHaveBeenCalledTimes(1)
      expect(succeed).toHaveBeenCalledWith('README template loaded')
    })

    it('should return readme default template content', async () => {
      const result = await buildReadmeContent(context, defaultTemplatePath)

      expect(result).toMatchSnapshot()
    })

    it('should return readme default template no html content', async () => {
      const result = await buildReadmeContent(
        context,
        defaultNoHtmlTemplatePath
      )

      expect(result).toMatchSnapshot()
    })

    it('should call ora with correct parameters in fail case', async () => {
      fs.readFile = jest.fn(() => {
        throw new Error('error')
      })

      try {
        await buildReadmeContent(context, defaultTemplatePath)
        // eslint-disable-next-line no-empty
      } catch (err) {}

      expect(ora).toHaveBeenCalledTimes(1)
      expect(ora).toHaveBeenCalledWith('Loading README template')
      expect(fail).toHaveBeenCalledTimes(1)
      expect(fail).toHaveBeenCalledWith('README template loading fail')
    })
  })

  describe('getReadmeTemplatePath', () => {
    it('should return template that user has selected', async () => {
      const useDefaultAnswers = false
      const actualResult = await getReadmeTemplatePath(
        undefined,
        useDefaultAnswers
      )

      expect(actualResult).toEqual(defaultTemplatePath)
      expect(chooseTemplate).toHaveBeenNthCalledWith(1, useDefaultAnswers)
    })

    it('should return custom template path if customTemplatePath is defined', async () => {
      const customTemplatePath = defaultTemplatePath

      const actualResult = await getReadmeTemplatePath(
        customTemplatePath,
        false
      )

      expect(actualResult).toEqual(customTemplatePath)
      expect(chooseTemplate).not.toHaveBeenCalled()
    })

    it('should throw an error if customTemplate is defined but invalid', () => {
      const wrongPath = 'wrong path'

      expect(getReadmeTemplatePath(wrongPath, false)).rejects.toThrow()
    })

    it('should call ora with correct parameters in fail case', async () => {
      const wrongPath = 'wrong path'

      try {
        await getReadmeTemplatePath(wrongPath, false)
        // eslint-disable-next-line no-empty
      } catch (err) {}

      expect(ora).toHaveBeenNthCalledWith(1, 'Resolving README template path')
      expect(fail).toHaveBeenNthCalledWith(
        1,
        "The template path 'wrong path' is not valid."
      )
    })

    it('should call ora with correct parameters in success case', async () => {
      await getReadmeTemplatePath(defaultTemplatePath, false)

      expect(ora).toHaveBeenNthCalledWith(1, 'Resolving README template path')
      expect(succeed).toHaveBeenNthCalledWith(
        1,
        'README template path resolved'
      )
    })
  })
})

jest.mock('ora')
jest.mock('./choose-template')
