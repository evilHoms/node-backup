creds.json is required. It can be accuired via google cloud service account (keys tab)
yarn install
tsc index.mts
mv index.mjs index.cjs - to rename (needed for bash script)

node ./index.cjs [options]
options:
post=`path_to_file` upload backup
get=`backup_id:backup_name?` download backup, if no name provided, will be saved with backup_id instead of name.
