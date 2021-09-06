PR_NUMBER=$(echo $GITHUB_REF | awk 'BEGIN { FS = "/" } ; { print $3 }')

echo "${GITHUB_PAT} ${HASURA_CLOUD_PAT} ${PR_NUMBER}"
