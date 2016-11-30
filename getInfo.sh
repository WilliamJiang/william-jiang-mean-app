#!/bin/bash

# 1.
# https://github.com/...
# git log | head -n 1 | cut -f1 -d" "
# git log | head  -n 1 | awk '{ print $2 }' | cut -c1-7
commit=`git log | head -n 1 | awk '{ print $2 }'`

link="https://github.com/.../commit/"
link=${link}${commit}

echo ${link}
echo ${commit}


# 2.
node_env=`echo $NODE_ENV`
[ $node_env ] || node_env='sandbox'

echo $node_env

# 3.
tbdir=server/app/env

if [ $node_env = 'development' ]; then

  db=$( cat ${tbdir}/development.js | grep 'mongodb:' | head  -1 | cut -f2 -d'@' | cut -f1 -d',' )

elif [ $node_env = 'qa' ]; then

  db=$( cat ${tbdir}/qa.js | grep 'mongodb:' | head  -1 | cut -f2 -d'@' | cut -f1 -d',' )

elif [ $node_env = 'sandbox' ]; then

  db=$( cat ${tbdir}/sandbox.js | grep 'mongodb:' | head  -1 | cut -f2 -d'@' | cut -f1 -d',' )

elif [ $node_env = 'production' ]; then

  db=$( cat ${tbdir}/production.js | grep 'mongodb:' | head  -1 | cut -f2 -d'@' | cut -f1 -d',' )

else

  db=$( cat ${tbdir}/development.js | grep 'mongodb:' | head  -1 | cut -f2 -d'@' | cut -f1 -d',' )

fi
echo $db