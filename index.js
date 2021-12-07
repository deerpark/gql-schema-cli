#! /usr/bin/env node
import fs from 'fs'
import { program } from 'commander'
import inquirer from 'inquirer'
import path from 'path'
import chalk from 'chalk'

const capitalize = string =>
  string.charAt(0).toUpperCase() + string.slice(1)

const getTemplate = (key, schema, schemaType) => {
  const type =
    schemaType === 'Query' || schemaType === 'q'
      ? 'Query'
      : 'Mutation'
  switch (key) {
    case 'resolvers':
      return `import client from '../../client'
  import { protectedResolver } from '../users.utility'
  
  const ${schema}ResolverFn = async (
    _,
    {  },
    { loggedInUser }
  ) => {
    const { id } = loggedInUser
    if () {
      return {
        ok: true,
      }
    } else {
      return {
        ok: false,
        error: '.',
      }
    }
  }
  
  export default {
    Mutation: {
      ${schema}: protectedResolver(${schema}ResolverFn),
    },
  }
  `
    case 'typeDefs':
      return `import { gql } from 'apollo-server'
  
  export default gql\`
    type ${capitalize(schema)}Result {
      ok: Boolean!
      error: String
    }
    type ${type} {
      ${schema}(
        username: String
      ): ${capitalize(schema)}Result!
    }
  \`
  `
    default:
      return false
  }
}

const checkExistDir = dir => {
  try {
    fs.accessSync(
      dir,
      fs.constants.F_OK |
        fs.constants.R_OK |
        fs.constants.W_OK
    )
    return true
  } catch {
    return false
  }
}

const mkDir = dir => {
  const dirName = path
    .relative('.', path.normalize(dir))
    .split(path.sep)
    .filter(p => !!p)
  dirName.forEach((_, index) => {
    const pathBuilder = dirName
      .slice(0, index + 1)
      .join(path.sep)
    if (!checkExistDir(pathBuilder)) {
      fs.mkdirSync(pathBuilder)
    }
  })
}

const makeTemplate = (schema, root = 'users', type) => {
  const directory = path.join(root, schema)
  const resolversExtention = '.resolvers.js'
  const typeDefsExtention = '.typeDefs.js'
  mkDir(directory)
  const resolversFilePath = path.join(
    directory,
    schema + resolversExtention
  )
  const typeDefsFilePath = path.join(
    directory,
    schema + typeDefsExtention
  )
  if (checkExistDir(resolversFilePath)) {
    console.error(
      `${chalk.bold.red(
        resolversFilePath
      )} file already exists.`
    )
  } else {
    fs.writeFileSync(
      resolversFilePath,
      getTemplate('resolvers', schema, type)
    )
    console.log(
      `${chalk.bold.red(
        resolversFilePath
      )} creation complete.`
    )
  }
  if (checkExistDir(typeDefsFilePath)) {
    console.error(
      `${chalk.bold.red(
        typeDefsFilePath
      )} file already exists.`
    )
  } else {
    fs.writeFileSync(
      typeDefsFilePath,
      getTemplate('typeDefs', schema, type)
    )
    console.log(
      `${chalk.bold.red(
        typeDefsFilePath
      )} creation complete.`
    )
  }
}

program.version('0.0.1', '-v, --version').name('gsc')

program
  .command('template <schema>')
  .usage('<schema> --root [root] --type [type]')
  .description('Create a template.')
  .alias('tpl')
  .option(
    '-r, --root [root]',
    'Enter the root directory.',
    'users'
  )
  .option(
    '-t, --type [type]',
    'Enter a name for the type. Query | Mutation',
    'Query'
  )
  .action((schema, options) => {
    makeTemplate(schema, options.root, options.type)
  })

program
  .action((_, args) => {
    if (args) {
      console.log(
        chalk.bold.red('The command could not be found.')
      )
      program.help()
    } else {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'schema',
            message: 'Enter a schema name.',
            default: 'index',
          },
          {
            type: 'input',
            name: 'root',
            message: 'Enter the root folder.',
            default: 'users',
          },
          {
            type: 'list',
            name: 'type',
            message: 'Choose a schema type.',
            choices: ['Query', 'Mutation'],
          },
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Create?',
          },
        ])
        .then(answers => {
          if (answers.confirm) {
            makeTemplate(
              answers.schema,
              answers.root,
              answers.type
            )
            console.log(
              chalk.rgb(128, 128, 128)('Exit the terminal.')
            )
          }
        })
    }
  })
  .parse(process.argv)
