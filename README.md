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