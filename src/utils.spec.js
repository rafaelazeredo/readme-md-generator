const loadJsonFile = require('load-json-file')
const boxen = require('boxen')
const path = require('path')
const getReposName = require('git-repo-name')
const fs = require('fs')

const realPathBasename = path.basename
const realGetReposNameSync = getReposName.sync

const {
  getPackageJson,
  showEndMessage,
  getProjectName,
  END_MSG,
  BOXEN_CONFIG,
  doesFileExist,
  getPackageManagerFromLockFile
} = require('./utils')

jest.mock('load-json-file')
jest.mock('boxen')
jest.mock('node-fetch')
jest.mock('fs')

describe('utils', () => {
  describe('getPackageJson', () => {
    const packageJsonContent = {
      name: 'readme-md-cli'
    }

    it('should return package.json content', async () => {
      loadJsonFile.mockReturnValueOnce(Promise.resolve(packageJsonContent))

      const result = await getPackageJson()

      expect(result).toEqual(packageJsonContent)
    })

    it('should return undefined', async () => {
      loadJsonFile.mockImplementationOnce(() => {
        throw new Error('ERROR')
      })

      const result = await getPackageJson()

      expect(result).toBeUndefined()
    })
  })

  describe('showEndMessage', () => {
    boxen.mockReturnValue(END_MSG)

    it('should call boxen with correct parameters', () => {
      showEndMessage()

      expect(boxen).toHaveBeenCalledTimes(1)
      expect(boxen).toHaveBeenCalledWith(END_MSG, BOXEN_CONFIG)
    })

    it('should call process.stdout.write with correct parameters', () => {
      process.stdout.write = jest.fn()

      showEndMessage()

      expect(process.stdout.write).toHaveBeenCalledTimes(1)
      expect(process.stdout.write).toHaveBeenCalledWith(END_MSG)
    })
  })

  describe('getProjectName', () => {
    const projectName = 'readme-md-generator'

    beforeEach(() => {
      path.basename = jest.fn(() => projectName)
      getReposName.sync = jest.fn()
    })

    afterEach(() => {
      path.basename = realPathBasename
      getReposName.sync = realGetReposNameSync
    })

    it('should return package.json name prop when defined', () => {
      const packageJson = { name: projectName }
      getReposName.sync.mockReturnValueOnce('readme-md-generator')

      const result = getProjectName(packageJson)

      expect(result).toEqual(projectName)
      expect(getReposName.sync).not.toHaveBeenCalled()
      expect(path.basename).not.toHaveBeenCalled()
    })

    it('should return git repos when package.json it is not defined', () => {
      const packageJson = undefined
      getReposName.sync.mockReturnValueOnce('readme-md-generator')

      const result = getProjectName(packageJson)

      expect(result).toEqual(projectName)
      expect(getReposName.sync).toHaveBeenCalled()
      expect(path.basename).not.toHaveBeenCalled()
    })

    it('should return folder basename when package.json and git repos name is undefined', () => {
      const packageJson = undefined
      getReposName.sync.mockImplementation(() => {
        throw new Error('error')
      })

      const result = getProjectName(packageJson)

      expect(result).toEqual(projectName)
      expect(getReposName.sync).toHaveBeenCalled()
      expect(path.basename).toHaveBeenCalled()
    })
  })

  describe('doesFileExist', () => {
    it('should return true when file exists for a given path', () => {
      fs.existsSync.mockReturnValueOnce(true)
      expect(doesFileExist('./file-path')).toBe(true)
    })

    it('should return false when file does not exist for a given path', () => {
      fs.existsSync.mockReturnValueOnce(false)
      expect(doesFileExist('./file-path')).toBe(false)
    })

    it('should return false if fs.existsSync throws an error', () => {
      fs.existsSync.mockImplementationOnce(() => {
        throw new Error('ERROR')
      })
      expect(doesFileExist('./file-path')).toBe(false)
    })
  })

  describe('getPackageManagerFromLockFile', () => {
    it('should return npm if only package-lock.json exists', () => {
      fs.existsSync.mockImplementation(
        filePath => filePath === 'package-lock.json'
      )

      const result = getPackageManagerFromLockFile()

      expect(result).toEqual('npm')
    })

    it('should return yarn if only yarn.lock exists', () => {
      fs.existsSync.mockImplementation(filePath => filePath === 'yarn.lock')

      const result = getPackageManagerFromLockFile()

      expect(result).toEqual('yarn')
    })

    it('should return undefined if only yarn.lock and package-lock.json exists', () => {
      fs.existsSync.mockImplementation(
        filePath => filePath === 'yarn.lock' || filePath === 'package-lock.json'
      )

      const result = getPackageManagerFromLockFile()

      expect(result).toBeUndefined()
    })

    it('should return undefined if only no lock file exists', () => {
      fs.existsSync.mockImplementation(() => false)

      const result = getPackageManagerFromLockFile()

      expect(result).toBeUndefined()
    })
  })
})
