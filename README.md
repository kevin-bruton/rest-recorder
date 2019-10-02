# Rest Recorder

This module is for recording and playing back REST API calls.

Many have found this module handy for several use cases:
- It is can be used as a mock server for tests, where the responses are recorded from real requests and later used in the "playback" mode.
- The recordings can also be used to speed up development, as the recorded responses will be a lot quicker and many times a lot more stable than having to depend on a remote server.
- The recordings are saved as readable json files, so you can edit or write the responses yourself without having to wait on changes in the remote server.
- You can also specify when similar, but not identical requests should return the same recorded response (by defining the "uniqueRecordingOn" option as a function).

It is an express server that listens to requests and has three modes:

RECORD: it receives the request, copies it, and makes the same request to a remote server. When it receives the response from the remote server, it saves the request and the response in the `recordings` folder, and then sends back the response to the original caller.

PLAYBACK: it receives the request and looks for it in the saved ones it has in the `recordings` folder. If it finds a recording that corresponds, it returns the recorded response to the original caller. If it doesn't find a matching request in its saved recordings, it returns a 403.

CACHE: it receives the request and looks for it in the saved requests it has in the `recordings` folder. If it finds a recording that corresponds, it returns the recorded response to the original caller. If it doesn't find a matching request in its saved recordings, it makes the request to the remote server and then saves the request and the response it receives in the `recordings` folder, and then it sends back the response to the original caller.

Command line options will override the configuration set in the configuration file.
This module, by default, looks for the configuration file in the root of the package where it is imported with the name `rest-recorder.config.js` and it is where you set the defaults for the recorder. If it doesn't find this file, it uses its own defaults.

Defaults:
  - remoteUrl: 'https://reqres.in'
  - restRecorderPort: '5500'
  - recordingsDir: 'rest-recordings'
  - mode: 'cache'
  - configFile: path.join(process.cwd(), 'rest-recorder.config.js')
  - dontSaveResponsesWithStatus: [401, 403, 404, 500]
  - getRecordingDirectoryArray: request => [request.domain, ...request.pathSegments, request.method]
  - getRecordingFilename: (request, hash) => hash(request.data)
  - log: true

The way to personalize these values will be described below in the config file section.

### Command line options
These command line options correspond to the config file values:

--configFile

--remoteUrl

--restRecorderPort

--mode

--recordingsDir

--log

### Config file:
The config file exports an object with the following properties:

  - remoteUrl: 
    + The base URL for the remote server
  - restRecorderPort:
    + The port to connect to the rest-recorder. The host would usually be localhost
  - recordingsDir: 
    + The directory in which the recordings are going to be saved
  - mode:
    + The mode. As described above, the possible modes are 'cache', 'record' and 'playback'
  - configFile:
    +  The location and name of the custom config file. Fo whatever is not specified there, the defaults will be used
  - dontSaveResponsesWithStatus:
    + If we receive the status codes in this array, the request will not be saved
  - getRecordingDirectoryArray:
    + This function will define the directory hierarchy of the recordings and should return an array which describes this hierarchy
    + 'request' is an object with the following properties: domain, pathSegments, data, headers and method
    + pathSegments is an array of the parts of the URL path
  - getRecordingFilename: (request, hash) => hash(request.data)
    + This function will define the file name of the recordings and should return it as a string
    + The '.json' extension will be added automatically, so it is not necessary to return it with an extension
    + The request paramter has the same properties as the one described above
    + The hash parameter is a function which can be used to hash the filename using whatever parts of the request we esteem convenient for our use case
  - log: true
    + Whether to show logs in the console or not

### Getting started

To install as a development dependency in your project:

`npm i -D rest-recorder`

And then from your project, you can prepare a config file. The default location for this file is in the root directory of the project and the default name is `rest-recorder.config.js`.

This is an example of a config file:
```
module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5500',
  restRecordingsDir: 'rest-recordings',
  mode: 'cache',
  getRecordingDirectoryArray: request => {
    return [request.domain, request.pathSegments[0]]
  },
  getRecordingFilename: (request, hash) => {
    if (request.pathSegments[0] === 'auth-token-dev') {
      return 'auth'
    } else {
      return request.data
        ? request.data.code
          ? request.data.code.replace(' ', '_')
          : request.data.text.replace(' ', '_')
        : 'error-response'
    }
  },
  log: true
}
```
However, you can include only the options you want to specify. For the rest, the defaults will be used.

If you have installed it as a development dependency in your project you can start the recorder with the following command:
`npx rest-recorder`

Please open an issue if you find one!
