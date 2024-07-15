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
    else if(process.platform === "linux") await exec.exec('sudo apt-get',['install', 'nsis', 'wine', 'mingw-w64'])
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

  #generators()
  {
    const generators = parser.getInput('generators', {type: 'string', default : ''})
    return ['-G',generators]
  }

  #configurations()
  {
    const configurations = parser.getInput('configurations', {type: 'string', default:''})
    if(configurations=='') return []
    else return ['-C',configurations]
  }

  #variables()
  {
    const value = parser.getInput('variables', {type: 'array',default:[]})
    let ret=[]
    for(const i in value)
    {
      ret=ret.concat('-D',value[i])
    }
    return ret;
  }

  #config_file()
  {
    const config_file = parser.getInput('config_file', {type: 'string', default: ''})
    if(config_file=='') return []
    else return ['--config',path.posix.resolve(config_file)]
  }

  #verbose()
  {
    const verbose = parser.getInput('verbose', {type: 'boolean', default: 'false'})
    if(verbose=='') return []
    else return ['--verbose']
  }

  #trace()
  {
    const trace = parser.getInput('trace', {type: 'boolean', default: 'false'})
    if(trace=='') return []
    else if (CPackVersionGreaterEqual('3.11')) return ['--trace']
    else return []
  }

  #trace_expand()
  {
    const trace_expand = parser.getInput('trace_expand', {type: 'boolean', default: 'false'})
    if(trace_expand=='') return []
    else if (CPackVersionGreaterEqual('3.11')) return ['--trace-expand']
    else return []
  }

  #package_name()
  {
    const package_name = parser.getInput('package_name', {type: 'string', default: ''})
    if(package_name=='') return []
    else return ['-P',package_name]
  }

  #package_version()
  {
    const package_version = parser.getInput('package_version', {type: 'string', default: ''})
    if(package_version=='') return []
    else return ['-R',package_version]
  }

  #packages_directory()
  {
    const packages_directory = parser.getInput('packages_directory', {type: 'string'})
    if(packages_directory=='') return []
    else return ['-B',path.posix.resolve(packages_directory)]
  }

  #vendor_name()
  {
    const vendor_name = parser.getInput('vendor_name', {type: 'string', default: ''})
    if(vendor_name=='') return []
    else return ['--vendor',vendor_name]
  }

  packCommandParameters()
  {
    let parameters=[]
    parameters=parameters.concat(this.#generators())
    parameters=parameters.concat(this.#configurations())
    parameters=parameters.concat(this.#variables())
    parameters=parameters.concat(this.#config_file())
    parameters=parameters.concat(this.#verbose())
    parameters=parameters.concat(this.#trace())
    parameters=parameters.concat(this.#trace_expand())
    parameters=parameters.concat(this.#package_name())
    parameters=parameters.concat(this.#package_version())
    parameters=parameters.concat(this.#packages_directory())
    parameters=parameters.concat(this.#vendor_name())
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
