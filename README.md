# run-cpack
GitHub action to run CPack

CPack command options and corresponding action parameters :

|  CPack option                                                  |  Action parameter      |  Descritpion                                                            |  Type    |  Default                         | Available  |
|:--------------------------------------------------------------:|:----------------------:|:-----------------------------------------------------------------------:|:--------:|:--------------------------------:|:----------:|
|                                                                |  binary_dir            |  Path to directory which CMake will use as the root of build directory  |  path    |  ""                              |  ✔️         |
|  -G                                                            |  generators            |  Semicolon-separated list of generator names                            |  string  |  ""                              |  ✔️         |
|  -C                                                            |  configurations        |  Specify the project configuration(s) to be packaged                    |  string  |  ""                              |  ✔️         |
|  -D                                                            |  variables             |  Set a CPack variable.                                                  |  array   |  []                              |  ✔️         |
|  --config                                                      |  config_file           |  Specify the configuration file read by cpack                           |  file    |  ""                              |  ✔️         |
|  -V, --verbose                                                 |  verbose               |  Run cpack with verbose output                                          |  bool    |  false                           |  ✔️         |
|  --trace                                                       |  trace                 |  Put the underlying cmake scripts in trace mode                         |  bool    |  false                           |  ✔️         |
|  --trace-expand                                                |  trace_expand          |  Put the underlying cmake scripts in expanded trace mode                |  bool    |  false                           |  ✔️         |
|  -P                                                            |  package_name          |  Override/define the value of the CPACK_PACKAGE_NAME variable           |  string  |  ""                              |  ✔️         |
|  -R                                                            |  package_version       |  Override/define the value of the CPACK_PACKAGE_VERSION variable        |  string  |  ""                              |  ✔️         |
|  -B                                                            |  packages_directory    |  Override/define CPACK_PACKAGE_DIRECTORY                                |  string  |  ""                              |  ✔️         |
|  --vendor                                                      |  vendor_name           |  Override/define CPACK_PACKAGE_VENDOR                                   |  string  |  ""                              |  ✔️         |