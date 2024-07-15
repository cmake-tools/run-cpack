const exec = require('@actions/exec')
const compare_version = require('compare-versions')
const parser = require('action-input-parser')
const core = require('@actions/core');
const which = require('which')
const path = require('path')

async function getCPackVersion()
{
  let cout ='';
  let cerr='';
  const options = {};
  options.listeners = {
    stdout: (data) => {
      cout = data.toString();
    },
    stderr: (data) => {
      cerr = data.toString();
    }
  }
  options.silent = true
  await exec.exec('cpack', ['--version'], options)
  let version_number = cout.match(/\d\.\d[\\.\d]+/)
  if (version_number.length === 0) throw String('Failing to parse CPack version')
  else return version_number[0]
}

async function installGenerators()
{
  let found_NSIS = false
  if(process.platform === "win32")
  {
    found_NSIS = which.sync('makensis.exe', { nothrow: true })
  }
  else
  {
    found_NSIS = which.sync('dot', { nothrow: true })
  }
  if(!found_NSIS)
  {
    if(process.platform === "win32") await exec.exec('choco',['install', 'nsis'])
    else if(process.platform === "linux") await exec.exec('sudo apt-get',['install', 'nsis'])
    else await exec.exec('brew', ['install', 'makensis'])
  }
}

function CPackVersionGreaterEqual(version)
{
  return compare_version.compare(global.cpack_version, version, '>=')
}

class CommandLineMaker
{
  constructor()
  {
    this.actual_path=path.resolve('./')
    this.#binary_dir()
  }

  workingDirectory()
  {
    return this.binary_dir
  }

  #binary_dir()
  {
    this.binary_dir = ''
    if(process.env.binary_dir) this.binary_dir = process.env.binary_dir
    else this.binary_dir = core.getInput('binary_dir', { required: false, default: '' })
    if(this.binary_dir!='')
    {
      this.binary_dir=path.posix.resolve(this.binary_dir)
    }
  }

  #generator()
  {
    const generators = parser.getInput('generators', {type: 'string'})
    return ['-G',generators]
  }

  packCommandParameters()
  {
    let parameters=[]
    parameters=parameters.concat(this.#generator())
    return parameters;
  }
}

function pack(command_line_maker)
{
  let cout ='';
  let cerr='';
  const options = {};
  options.listeners = {
    stdout: (data) => {
      cout = data.toString();
    },
    stderr: (data) => {
      cerr = data.toString();
    } 
  }
  options.silent = false
  options.cwd = command_line_maker.workingDirectory()
  exec.exec('cpack',command_line_maker.packCommandParameters(), options)
}

async function main()
{
  try
  {
    let found = which.sync('cpack', { nothrow: true })
    if(!found) throw String('not found: CPack')
    await installGenerators()
    global.cpack_version= await getCPackVersion()
    const command_line_maker = new CommandLineMaker()
    pack(command_line_maker)
  }
  catch (error)
  {
    core.setFailed(error)
  }
}

main()
