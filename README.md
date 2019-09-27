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
  - mode: 'cache'
  - remoteUrl: 'http://localhost:5000'
  - restRecorderPort: '5500'
  - recordingsDir: 'rest-recordings'

### Command line options
--configFile
--remoteUrl
--restRecorderPort
--mode
--recordingsDir

### Config file:
The config file exports an object with the following properties:

- remoteUrl: The complete URL of the remote server we will be recording (host and port)

- restRecorderPort: The host and port which the rest-recorder will be listening to requests on

- mode: May have three possible values: 'playback', 'record', or 'cache'

- recordingsDir: The directory where the recordings will be saved

- uniqueRecordingOn: A function defined in the user's configuration file that returns what should be used to calculate unique data
  - There may be cases where you want the same response for similar, but different requests. For these cases, being able to define this function comes in handy.
  - The function will be called with one paramter which will be an object with the following properties: url, headers, params, data
  - This function should return an object that will be used to calculate the unique hash code for the request. This hash code will be identifier and file name of the recording.

### Getting started

To install as a development dependency in your project:

`npm install -D rest-recorder`

And then from your project, you can prepare a config file. The default location for this file is in the root directory of the project and the default name is `rest-recorder.config.js`.

A config file could look something like this:
```
module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5500',
  restRecordingsDir: 'rest-recordings',
  mode: 'cache',
  uniqueRecordingOn: request => request,
  log: true
}
```
However, you can include only the options you want to specify. For the rest, the defaults will be used.

If you have installed it as a development dependency in your project you can start the recorder with the following command:
`npx rest-recorder`
