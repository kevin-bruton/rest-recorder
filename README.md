# Rest Recorder

This module is for recording and playing back REST API calls
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
  - There may be cases where we cant the same response for similar, but different requests. For these cases, being able to define this function comes in handy.
  - The function with be called with one paramter which will be an object with the following properties: url, headers, params, data

### Getting started

To install:

`npm install -D rest-recorder`

And then from your project, you can prepare a config file. The default location for this file is in the root directory of the project and the default name is `rest-recorder.config.js`.

A config file could look something like this:
```
module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5500',
  restRecordingsDir: 'rest-recordings',
  mode: CACHE,
  uniqueRecordingOn: request => request,
  log: true
}
```
However, you can include only the options you want to specify. For the rest, the defaults will be used.
