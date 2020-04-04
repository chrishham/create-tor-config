# create-tor-config
Script to create multiple tor configurations

## Usage
The following enviroment variables have to be present e.g.:

```sh
TOR_CONTROL_PASSWORD="zebra"
TOR_NUM_OF_PROCESSES="10"
```

Run the following commands.

```sh
wget https://github.com/chrishham/create-tor-config/releases/download/v1.0/create-tor-config-linux

chmod +x ./create-tor-config-linux

./create-tor-config-linux
```

## TODO
Add more options to torrc file 