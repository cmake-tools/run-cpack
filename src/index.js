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

function CPackVersionGreaterEqual(version)
{
  return compare_version.compare(global.cpack_version, version, '>=')
}

class CommandLineMaker
{
  constructor()
  {
    this.actual_path=path.resolve('./')
  }
  packCommandParameters()
  {
    return ['--help']
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
  exec.exec('cpack',command_line_maker.packCommandParameters(), options)
}

async function main()
{
  try
  {
    let found = which.sync('cpack', { nothrow: true })
    if(!found) throw String('not found: CPack')
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
