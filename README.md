# Description

NodeJs script to work with google service account's drive.
Allow to upload files, show uploaded files, download.

# Usage

creds.json is required. It can be acquired via google cloud service account (keys tab). Put in in node-backup root.

`yarn install` install dependencies  
`tsc index.mts` compile to js  
`mv index.mjs index.cjs` rename  
`node ./index.cjs [options]`  
or  
`yarn start [options]` (ts-node is required for this)

### Options

`post=path_to_file` upload backup  
`get=backup_id:backup_name?` download backup, if no name provided, will be saved with backup_id instead of name.  
If no options provided, it will show list of previously uploaded files.
