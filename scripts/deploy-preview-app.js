import fetch from 'node-fetch';
const GITHUB_TOKEN = process.env.GITHUB_PAT || '';
const HASURA_CLOUD_PAT = process.env.HASURA_CLOUD_PAT || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_BRANCH_NAME = process.env.GITHUB_HEAD_REF || '';
const HASURA_PROJECT_DIR_PATH = process.env.HASURA_PROJECT_DIR_PATH || '';
const PR_NUMBER = process.env.PR_NUMBER || '123';
const CLOUD_DATA_GRAPHQL = process.env.CLOUD_DATA_GRAPHQL || 'https://data.lux-dev.hasura.me';

const deployPreviewApp = () => {

	const GITHUB_OWNER = GITHUB_REPOSITORY.split('/')[0];
	const GITHUB_REPO = GITHUB_REPOSITORY.split('/')[1];

	const PREVIEW_APP_NAME = `pr-${PR_NUMBER}`;
	console.log(
		`
		GITHUB_TOKEN: ${GITHUB_TOKEN},
		GITHUB_REPO: ${GITHUB_REPO},
		GITHUB_OWNER: ${GITHUB_OWNER},
		GITHUB_BRANCH_NAME: ${GITHUB_BRANCH_NAME},
		HASURA_PROJECT_DIR_PATH: ${HASURA_PROJECT_DIR_PATH},
		HASURA_CLOUD_PAT: ${HASURA_CLOUD_PAT},
		PREVIEW_APP_NAME: ${PREVIEW_APP_NAME},
		CLOUD_DATA_GRAPHQL: ${CLOUD_DATA_GRAPHQL}
		`
	);

	// const previewAppName = `pr-${PR_NUMBER}`;
	// return fetch(
	// 	CLOUD_DATA_GRAPHQL,
	// 	{
	// 		method: 'POST',
	// 		headers: {
	// 			'authorization': `PAT ${HASURA_CLOUD_PAT}`
	// 		},
	// 		body: JSON.stringify({
	// 			query: `

	// 			`,
	// 			variables: {

	// 			}
	// 		})
	// 	}
	// )
}

deployPreviewApp();
